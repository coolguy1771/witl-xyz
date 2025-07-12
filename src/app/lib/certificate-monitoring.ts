import {
  CertificateAlert,
  CertificateMonitoringRule,
  NotificationSettings,
  WebhookPayload,
} from "@/types/monitoring";
import { getSSLInfo } from "./ssl-simple";

export class CertificateMonitoringService {
  private static instance: CertificateMonitoringService;
  private monitoringRules: Map<string, CertificateMonitoringRule> = new Map();
  private alerts: Map<string, CertificateAlert> = new Map();

  private constructor() {
    // Load existing rules and alerts from storage
    this.loadFromStorage();
  }

  public static getInstance(): CertificateMonitoringService {
    if (!CertificateMonitoringService.instance) {
      CertificateMonitoringService.instance =
        new CertificateMonitoringService();
    }
    return CertificateMonitoringService.instance;
  }

  // Certificate Monitoring Rules Management
  public addMonitoringRule(
    rule: Omit<CertificateMonitoringRule, "id" | "createdAt">
  ): string {
    const id = this.generateId();
    const fullRule: CertificateMonitoringRule = {
      ...rule,
      id,
      createdAt: new Date().toISOString(),
    };

    this.monitoringRules.set(id, fullRule);
    this.saveToStorage();

    // Schedule immediate check
    this.scheduleCheck(id);

    return id;
  }

  public updateMonitoringRule(
    id: string,
    updates: Partial<CertificateMonitoringRule>
  ): boolean {
    const rule = this.monitoringRules.get(id);
    if (!rule) return false;

    const updatedRule = { ...rule, ...updates };
    this.monitoringRules.set(id, updatedRule);
    this.saveToStorage();

    return true;
  }

  public removeMonitoringRule(id: string): boolean {
    const deleted = this.monitoringRules.delete(id);
    if (deleted) {
      this.saveToStorage();
      // Remove related alerts
      this.alerts.forEach((alert, alertId) => {
        if (alert.domain === this.monitoringRules.get(id)?.domain) {
          this.alerts.delete(alertId);
        }
      });
    }
    return deleted;
  }

  public getMonitoringRules(): CertificateMonitoringRule[] {
    return Array.from(this.monitoringRules.values());
  }

  public getMonitoringRule(id: string): CertificateMonitoringRule | undefined {
    return this.monitoringRules.get(id);
  }

  // Certificate Checking
  public async checkCertificate(ruleId: string): Promise<CertificateAlert[]> {
    const rule = this.monitoringRules.get(ruleId);
    if (!rule || !rule.enabled) return [];

    try {
      const sslInfo = await getSSLInfo(rule.domain);
      const newAlerts: CertificateAlert[] = [];

      // Update last checked time
      rule.lastChecked = new Date().toISOString();
      this.monitoringRules.set(ruleId, rule);

      // Check for expiration alerts
      if (sslInfo.valid && sslInfo.daysUntilExpiry !== undefined) {
        for (const threshold of rule.alertThresholds.daysBeforeExpiry) {
          if (sslInfo.daysUntilExpiry <= threshold) {
            const alertId = this.generateAlertId(
              rule.domain,
              "expiration",
              threshold
            );

            // Check if this alert already exists
            if (!this.alerts.has(alertId)) {
              const alert: CertificateAlert = {
                id: alertId,
                domain: rule.domain,
                alertType: "expiration",
                severity: this.getSeverityForDays(sslInfo.daysUntilExpiry),
                message: `Certificate for ${rule.domain} expires in ${sslInfo.daysUntilExpiry} days`,
                triggeredAt: new Date().toISOString(),
                daysUntilExpiry: sslInfo.daysUntilExpiry,
                notificationMethods: this.getNotificationMethods(rule),
                acknowledged: false,
              };

              this.alerts.set(alertId, alert);
              newAlerts.push(alert);
            }
          }
        }
      }

      // Check for invalid certificate alerts
      if (rule.alertThresholds.enableInvalidCertAlerts && !sslInfo.valid) {
        const alertId = this.generateAlertId(rule.domain, "invalid");

        if (!this.alerts.has(alertId)) {
          const alert: CertificateAlert = {
            id: alertId,
            domain: rule.domain,
            alertType: "invalid",
            severity: "critical",
            message: `Invalid SSL certificate detected for ${rule.domain}: ${sslInfo.error || "Certificate validation failed"}`,
            triggeredAt: new Date().toISOString(),
            notificationMethods: this.getNotificationMethods(rule),
            acknowledged: false,
          };

          this.alerts.set(alertId, alert);
          newAlerts.push(alert);
        }
      }

      // Send notifications for new alerts
      for (const alert of newAlerts) {
        await this.sendNotifications(alert, rule);
      }

      this.saveToStorage();
      return newAlerts;
    } catch (error) {
      console.error(`Failed to check certificate for ${rule.domain}:`, error);

      // Create an alert for the check failure
      const alertId = this.generateAlertId(rule.domain, "invalid");
      const alert: CertificateAlert = {
        id: alertId,
        domain: rule.domain,
        alertType: "invalid",
        severity: "high",
        message: `Failed to check certificate for ${rule.domain}: ${error instanceof Error ? error.message : "Unknown error"}`,
        triggeredAt: new Date().toISOString(),
        notificationMethods: this.getNotificationMethods(rule),
        acknowledged: false,
      };

      this.alerts.set(alertId, alert);
      await this.sendNotifications(alert, rule);
      this.saveToStorage();

      return [alert];
    }
  }

  // Check all active monitoring rules
  public async checkAllCertificates(): Promise<CertificateAlert[]> {
    const allAlerts: CertificateAlert[] = [];

    for (const rule of this.monitoringRules.values()) {
      if (rule.enabled) {
        const alerts = await this.checkCertificate(rule.id);
        allAlerts.push(...alerts);
      }
    }

    return allAlerts;
  }

  // Alert Management
  public getAlerts(domain?: string): CertificateAlert[] {
    const alerts = Array.from(this.alerts.values());
    return domain ? alerts.filter(alert => alert.domain === domain) : alerts;
  }

  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    alert.acknowledgedAt = new Date().toISOString();
    this.alerts.set(alertId, alert);
    this.saveToStorage();

    return true;
  }

  public resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.resolvedAt = new Date().toISOString();
    this.alerts.set(alertId, alert);
    this.saveToStorage();

    return true;
  }

  public deleteAlert(alertId: string): boolean {
    const deleted = this.alerts.delete(alertId);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  // Notification Methods
  private async sendNotifications(
    alert: CertificateAlert,
    rule: CertificateMonitoringRule
  ): Promise<void> {
    const promises: Promise<void>[] = [];

    // Browser notification
    if (
      alert.notificationMethods.includes("browser") &&
      rule.notificationSettings.enableBrowserNotifications
    ) {
      promises.push(this.sendBrowserNotification(alert));
    }

    // Webhook notification
    if (
      alert.notificationMethods.includes("webhook") &&
      rule.notificationSettings.webhookUrl
    ) {
      promises.push(
        this.sendWebhookNotification(
          alert,
          rule.notificationSettings.webhookUrl
        )
      );
    }

    // Email notification would be handled by external service
    if (
      alert.notificationMethods.includes("email") &&
      rule.notificationSettings.email
    ) {
      promises.push(
        this.sendEmailNotification(alert, rule.notificationSettings.email)
      );
    }

    await Promise.allSettled(promises);
  }

  private async sendBrowserNotification(
    alert: CertificateAlert
  ): Promise<void> {
    try {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`SSL Certificate Alert - ${alert.domain}`, {
          body: alert.message,
          icon: "/favicon.ico",
          tag: alert.id,
        });
      }
    } catch (error) {
      console.error("Failed to send browser notification:", error);
    }
  }

  private async sendWebhookNotification(
    alert: CertificateAlert,
    webhookUrl: string
  ): Promise<void> {
    try {
      const payload: WebhookPayload = {
        event: `certificate.${alert.alertType}`,
        timestamp: alert.triggeredAt,
        domain: alert.domain,
        data: alert,
      };

      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "SSL-Monitor-Webhook/1.0",
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Failed to send webhook notification:", error);
    }
  }

  private async sendEmailNotification(
    alert: CertificateAlert,
    email: string
  ): Promise<void> {
    try {
      // In a real implementation, this would integrate with an email service
      // For now, we'll just log it
      console.log(`Email notification sent to ${email}:`, alert.message);
    } catch (error) {
      console.error("Failed to send email notification:", error);
    }
  }

  // Utility Methods
  private getSeverityForDays(days: number): CertificateAlert["severity"] {
    if (days <= 0) return "critical";
    if (days <= 7) return "high";
    if (days <= 30) return "medium";
    return "low";
  }

  private getNotificationMethods(
    rule: CertificateMonitoringRule
  ): CertificateAlert["notificationMethods"] {
    const methods: CertificateAlert["notificationMethods"] = [];

    if (rule.notificationSettings.enableBrowserNotifications) {
      methods.push("browser");
    }
    if (rule.notificationSettings.webhookUrl) {
      methods.push("webhook");
    }
    if (rule.notificationSettings.email) {
      methods.push("email");
    }

    return methods;
  }

  private scheduleCheck(ruleId: string): void {
    const rule = this.monitoringRules.get(ruleId);
    if (!rule) return;

    // Schedule next check based on interval
    setTimeout(
      () => {
        this.checkCertificate(ruleId);
        // Reschedule for next interval
        this.scheduleCheck(ruleId);
      },
      rule.checkInterval * 60 * 60 * 1000
    ); // Convert hours to milliseconds
  }

  private generateId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateAlertId(
    domain: string,
    type: string,
    threshold?: number
  ): string {
    const suffix = threshold ? `_${threshold}days` : "";
    return `alert_${domain}_${type}${suffix}`;
  }

  // Storage Methods (using localStorage in browser, could be adapted for server-side storage)
  private loadFromStorage(): void {
    try {
      if (typeof window !== "undefined") {
        const rulesData = localStorage.getItem("ssl_monitoring_rules");
        const alertsData = localStorage.getItem("ssl_monitoring_alerts");

        if (rulesData) {
          const rules = JSON.parse(rulesData);
          this.monitoringRules = new Map(Object.entries(rules));
        }

        if (alertsData) {
          const alerts = JSON.parse(alertsData);
          this.alerts = new Map(Object.entries(alerts));
        }
      }
    } catch (error) {
      console.error("Failed to load monitoring data from storage:", error);
    }
  }

  private saveToStorage(): void {
    try {
      if (typeof window !== "undefined") {
        const rulesObj = Object.fromEntries(this.monitoringRules);
        const alertsObj = Object.fromEntries(this.alerts);

        localStorage.setItem("ssl_monitoring_rules", JSON.stringify(rulesObj));
        localStorage.setItem(
          "ssl_monitoring_alerts",
          JSON.stringify(alertsObj)
        );
      }
    } catch (error) {
      console.error("Failed to save monitoring data to storage:", error);
    }
  }

  // Public methods for managing browser notifications
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if ("Notification" in window) {
      return await Notification.requestPermission();
    }
    return "denied";
  }

  public getNotificationPermission(): NotificationPermission | "unsupported" {
    if ("Notification" in window) {
      return Notification.permission;
    }
    return "unsupported";
  }
}
