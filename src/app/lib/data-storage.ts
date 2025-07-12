import { MonitoringHistory, DashboardMetrics } from "@/types/monitoring";
import { PerformanceMetrics } from "@/types/monitoring";
import { SecurityHeadersAnalysis } from "@/types/monitoring";
import { SSLCertificateSimple } from "./ssl-simple";

export class DataStorageService {
  private static instance: DataStorageService;
  private storageKey = "monitoring_data_v1";

  private constructor() {}

  public static getInstance(): DataStorageService {
    if (!DataStorageService.instance) {
      DataStorageService.instance = new DataStorageService();
    }
    return DataStorageService.instance;
  }

  // Historical Data Storage
  public saveMonitoringData(
    domain: string,
    type: "certificate" | "security" | "performance",
    data: SSLCertificateSimple | SecurityHeadersAnalysis | PerformanceMetrics,
    status: "healthy" | "warning" | "critical" | "unknown" = "healthy"
  ): void {
    try {
      const history = this.getMonitoringHistory(domain);

      const entry: MonitoringHistory = {
        domain,
        type,
        timestamp: new Date().toISOString(),
        data,
        status,
      };

      history.push(entry);

      // Keep only last 1000 entries per domain to prevent storage bloat
      const maxEntries = 1000;
      if (history.length > maxEntries) {
        history.splice(0, history.length - maxEntries);
      }

      this.saveHistoryToStorage(domain, history);
    } catch (error) {
      console.error("Failed to save monitoring data:", error);
    }
  }

  public getMonitoringHistory(
    domain: string,
    type?: "certificate" | "security" | "performance",
    days: number = 30
  ): MonitoringHistory[] {
    try {
      const allHistory = this.loadHistoryFromStorage(domain);
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      let filteredHistory = allHistory.filter(
        entry => new Date(entry.timestamp) >= cutoffDate
      );

      if (type) {
        filteredHistory = filteredHistory.filter(entry => entry.type === type);
      }

      return filteredHistory.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error("Failed to get monitoring history:", error);
      return [];
    }
  }

  public getAllDomains(): string[] {
    try {
      if (typeof window === "undefined") return [];

      const keys = Object.keys(localStorage).filter(key =>
        key.startsWith(this.storageKey)
      );

      return keys.map(key => key.replace(`${this.storageKey}_`, ""));
    } catch (error) {
      console.error("Failed to get all domains:", error);
      return [];
    }
  }

  public getDashboardMetrics(): DashboardMetrics {
    try {
      const domains = this.getAllDomains();
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      let healthyDomains = 0;
      let warningDomains = 0;
      let criticalDomains = 0;
      let certificatesExpiringSoon = 0;
      let totalResponseTimes: number[] = [];
      let totalSecurityScores: number[] = [];
      let totalAlerts = 0;
      let unresolvedAlerts = 0;

      domains.forEach(domain => {
        const recentHistory = this.getMonitoringHistory(domain, undefined, 1);

        if (recentHistory.length === 0) return;

        // Get latest status for each monitoring type
        const latestCert = recentHistory.find(h => h.type === "certificate");
        const latestSecurity = recentHistory.find(h => h.type === "security");
        const latestPerformance = recentHistory.find(
          h => h.type === "performance"
        );

        // Determine overall domain status
        const statuses = [
          latestCert?.status,
          latestSecurity?.status,
          latestPerformance?.status,
        ].filter(Boolean) as string[];

        if (statuses.includes("critical")) {
          criticalDomains++;
        } else if (statuses.includes("warning")) {
          warningDomains++;
        } else if (statuses.length > 0) {
          healthyDomains++;
        }

        // Certificate expiration analysis
        if (
          latestCert &&
          latestCert.data &&
          typeof latestCert.data === "object"
        ) {
          const certData = latestCert.data as SSLCertificateSimple;
          if (
            certData.daysUntilExpiry !== undefined &&
            certData.daysUntilExpiry <= 30
          ) {
            certificatesExpiringSoon++;
          }
        }

        // Performance metrics
        if (
          latestPerformance &&
          latestPerformance.data &&
          typeof latestPerformance.data === "object"
        ) {
          const perfData = latestPerformance.data as PerformanceMetrics;
          if (perfData.metrics.responseTime > 0) {
            totalResponseTimes.push(perfData.metrics.responseTime);
          }
        }

        // Security scores
        if (
          latestSecurity &&
          latestSecurity.data &&
          typeof latestSecurity.data === "object"
        ) {
          const secData = latestSecurity.data as SecurityHeadersAnalysis;
          if (secData.overallScore !== undefined) {
            totalSecurityScores.push(secData.overallScore);
          }
        }
      });

      // Calculate averages
      const averageResponseTime =
        totalResponseTimes.length > 0
          ? Math.round(
              totalResponseTimes.reduce((a, b) => a + b, 0) /
                totalResponseTimes.length
            )
          : 0;

      const averageSecurityScore =
        totalSecurityScores.length > 0
          ? Math.round(
              totalSecurityScores.reduce((a, b) => a + b, 0) /
                totalSecurityScores.length
            )
          : 0;

      return {
        totalDomains: domains.length,
        healthyDomains,
        warningDomains,
        criticalDomains,
        certificatesExpiringSoon,
        averageResponseTime,
        averageSecurityScore,
        totalAlerts,
        unresolvedAlerts,
      };
    } catch (error) {
      console.error("Failed to calculate dashboard metrics:", error);
      return {
        totalDomains: 0,
        healthyDomains: 0,
        warningDomains: 0,
        criticalDomains: 0,
        certificatesExpiringSoon: 0,
        averageResponseTime: 0,
        averageSecurityScore: 0,
        totalAlerts: 0,
        unresolvedAlerts: 0,
      };
    }
  }

  public getTimeSeriesData(
    domain: string,
    type: "certificate" | "security" | "performance",
    metric: string,
    days: number = 7
  ): { timestamp: string; value: number }[] {
    try {
      const history = this.getMonitoringHistory(domain, type, days);

      return history
        .map(entry => {
          let value = 0;

          if (
            type === "certificate" &&
            entry.data &&
            typeof entry.data === "object"
          ) {
            const certData = entry.data as SSLCertificateSimple;
            switch (metric) {
              case "daysUntilExpiry":
                value = certData.daysUntilExpiry || 0;
                break;
              case "valid":
                value = certData.valid ? 1 : 0;
                break;
            }
          } else if (
            type === "security" &&
            entry.data &&
            typeof entry.data === "object"
          ) {
            const secData = entry.data as SecurityHeadersAnalysis;
            switch (metric) {
              case "overallScore":
                value = secData.overallScore || 0;
                break;
            }
          } else if (
            type === "performance" &&
            entry.data &&
            typeof entry.data === "object"
          ) {
            const perfData = entry.data as PerformanceMetrics;
            switch (metric) {
              case "responseTime":
                value = perfData.metrics.responseTime;
                break;
              case "firstByteTime":
                value = perfData.metrics.firstByteTime;
                break;
              case "httpStatus":
                value = perfData.httpStatus;
                break;
            }
          }

          return {
            timestamp: entry.timestamp,
            value,
          };
        })
        .reverse(); // Show oldest first for time series
    } catch (error) {
      console.error("Failed to get time series data:", error);
      return [];
    }
  }

  public deleteMonitoringData(domain: string): boolean {
    try {
      if (typeof window === "undefined") return false;

      localStorage.removeItem(`${this.storageKey}_${domain}`);
      return true;
    } catch (error) {
      console.error("Failed to delete monitoring data:", error);
      return false;
    }
  }

  public exportData(domain?: string): any {
    try {
      if (domain) {
        return {
          domain,
          history: this.getMonitoringHistory(domain),
          exportedAt: new Date().toISOString(),
        };
      } else {
        const domains = this.getAllDomains();
        return {
          domains: domains.map(d => ({
            domain: d,
            history: this.getMonitoringHistory(d),
          })),
          exportedAt: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error("Failed to export data:", error);
      return null;
    }
  }

  public importData(data: any): boolean {
    try {
      if (data.domain && data.history) {
        // Single domain import
        this.saveHistoryToStorage(data.domain, data.history);
        return true;
      } else if (data.domains && Array.isArray(data.domains)) {
        // Multiple domains import
        data.domains.forEach((domainData: any) => {
          if (domainData.domain && domainData.history) {
            this.saveHistoryToStorage(domainData.domain, domainData.history);
          }
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to import data:", error);
      return false;
    }
  }

  // Private storage methods
  private loadHistoryFromStorage(domain: string): MonitoringHistory[] {
    try {
      if (typeof window === "undefined") return [];

      const data = localStorage.getItem(`${this.storageKey}_${domain}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to load history from storage:", error);
      return [];
    }
  }

  private saveHistoryToStorage(
    domain: string,
    history: MonitoringHistory[]
  ): void {
    try {
      if (typeof window === "undefined") return;

      localStorage.setItem(
        `${this.storageKey}_${domain}`,
        JSON.stringify(history)
      );
    } catch (error) {
      console.error("Failed to save history to storage:", error);
    }
  }

  // Cleanup old data
  public cleanupOldData(maxAgeInDays: number = 90): void {
    try {
      const domains = this.getAllDomains();
      const cutoffDate = new Date(
        Date.now() - maxAgeInDays * 24 * 60 * 60 * 1000
      );

      domains.forEach(domain => {
        const history = this.loadHistoryFromStorage(domain);
        const filteredHistory = history.filter(
          entry => new Date(entry.timestamp) >= cutoffDate
        );

        if (filteredHistory.length !== history.length) {
          this.saveHistoryToStorage(domain, filteredHistory);
        }
      });
    } catch (error) {
      console.error("Failed to cleanup old data:", error);
    }
  }
}
