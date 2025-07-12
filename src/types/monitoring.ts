// Certificate Monitoring Types
export interface CertificateAlert {
  id: string;
  domain: string;
  alertType: "expiration" | "renewal" | "change" | "invalid";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  triggeredAt: string;
  daysUntilExpiry?: number;
  notificationMethods: ("email" | "webhook" | "browser")[];
  acknowledged: boolean;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface CertificateMonitoringRule {
  id: string;
  domain: string;
  enabled: boolean;
  checkInterval: number; // in hours
  alertThresholds: {
    daysBeforeExpiry: number[];
    enableChangeDetection: boolean;
    enableInvalidCertAlerts: boolean;
  };
  notificationSettings: {
    email?: string;
    webhookUrl?: string;
    enableBrowserNotifications: boolean;
  };
  createdAt: string;
  lastChecked?: string;
}

// Security Headers Types
export interface SecurityHeader {
  name: string;
  value?: string;
  present: boolean;
  secure: boolean;
  severity: "info" | "warning" | "error";
  recommendation?: string;
}

export interface SecurityHeadersAnalysis {
  domain: string;
  timestamp: string;
  overallScore: number; // 0-100
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  headers: {
    "strict-transport-security": SecurityHeader;
    "content-security-policy": SecurityHeader;
    "x-frame-options": SecurityHeader;
    "x-content-type-options": SecurityHeader;
    "x-xss-protection": SecurityHeader;
    "referrer-policy": SecurityHeader;
    "permissions-policy": SecurityHeader;
  };
  recommendations: string[];
  vulnerabilities: string[];
}

// Performance Monitoring Types
export interface PerformanceMetrics {
  domain: string;
  timestamp: string;
  metrics: {
    responseTime: number; // in ms
    firstByteTime: number; // TTFB in ms
    dnsLookupTime: number;
    connectionTime: number;
    downloadTime: number;
    totalTime: number;
  };
  httpStatus: number;
  contentSize: number; // in bytes
  redirectCount: number;
  fromCache: boolean;
  location: string; // monitoring location
}

export interface PerformanceThresholds {
  responseTime: { warning: number; critical: number };
  firstByteTime: { warning: number; critical: number };
  availability: { warning: number; critical: number }; // percentage
}

// Historical Data Types
export interface MonitoringHistory {
  domain: string;
  type: "certificate" | "security" | "performance";
  timestamp: string;
  data: any; // Flexible for different data types
  status: "healthy" | "warning" | "critical" | "unknown";
}

export interface DashboardMetrics {
  totalDomains: number;
  healthyDomains: number;
  warningDomains: number;
  criticalDomains: number;
  certificatesExpiringSoon: number;
  averageResponseTime: number;
  averageSecurityScore: number;
  totalAlerts: number;
  unresolvedAlerts: number;
}

// API Types
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: ("read" | "write" | "admin")[];
  rateLimit: number; // requests per hour
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface ApiUsage {
  keyId: string;
  endpoint: string;
  method: string;
  timestamp: string;
  responseTime: number;
  statusCode: number;
  userAgent?: string;
  ipAddress?: string;
}

// Webhook Types
export interface WebhookConfig {
  id: string;
  url: string;
  events: (
    | "certificate.expiring"
    | "certificate.expired"
    | "certificate.changed"
    | "performance.degraded"
    | "security.issue"
  )[];
  headers?: Record<string, string>;
  secret?: string; // For signature verification
  enabled: boolean;
  createdAt: string;
  lastTriggered?: string;
  failureCount: number;
}

export interface WebhookPayload {
  event: string;
  timestamp: string;
  domain: string;
  data: any;
  signature?: string;
}

// Notification Types
export interface NotificationSettings {
  email?: {
    enabled: boolean;
    address: string;
    frequency: "immediate" | "hourly" | "daily";
  };
  browser?: {
    enabled: boolean;
    permission: "granted" | "denied" | "default";
  };
  webhook?: {
    enabled: boolean;
    urls: string[];
  };
}

// Combined monitoring result
export interface DomainMonitoringResult {
  domain: string;
  timestamp: string;
  certificate: import("../app/lib/ssl-simple").SSLCertificateSimple;
  securityHeaders: SecurityHeadersAnalysis;
  performance: PerformanceMetrics;
  alerts: CertificateAlert[];
  overallStatus: "healthy" | "warning" | "critical";
  recommendations: string[];
}
