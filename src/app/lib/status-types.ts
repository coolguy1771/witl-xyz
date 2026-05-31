export type ServiceStatus = "operational" | "degraded" | "down";

export interface StatusCheckResult {
  name: string;
  status: ServiceStatus;
  latencyMs: number;
  message: string;
}

export interface StatusReport {
  status: ServiceStatus;
  checkedAt: string;
  checks: StatusCheckResult[];
}
