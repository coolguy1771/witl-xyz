import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticateApiRequest,
  ApiKeyManager,
} from "@/app/lib/api-management";
import { getSSLInfo } from "@/app/lib/ssl-simple";
import { SecurityHeadersAnalyzer } from "@/app/lib/security-headers";
import { PerformanceMonitor } from "@/app/lib/performance-monitor";
import { DataStorageService } from "@/app/lib/data-storage";
import { handleApiError, ValidationError } from "@/app/lib/error-handler";

const monitorRequestSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain is required")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
      "Invalid domain format"
    ),
  checks: z
    .array(z.enum(["certificate", "security", "performance"]))
    .default(["certificate", "security", "performance"]),
  saveResults: z.boolean().default(false),
});

const batchMonitorSchema = z.object({
  domains: z.array(z.string()).max(10, "Maximum 10 domains per batch request"),
  checks: z
    .array(z.enum(["certificate", "security", "performance"]))
    .default(["certificate", "security", "performance"]),
  saveResults: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authenticate API request
    const auth = authenticateApiRequest(request);

    if (!auth.authenticated) {
      const headers: Record<string, string> = {
        "X-RateLimit-Limit": "1000",
        "X-RateLimit-Remaining": "0",
      };

      if (auth.rateLimited) {
        headers["X-RateLimit-Remaining"] =
          auth.remainingRequests?.toString() || "0";
        headers["Retry-After"] = "3600"; // 1 hour
      }

      return NextResponse.json(
        {
          success: false,
          error: auth.error,
          code: auth.rateLimited ? "RATE_LIMITED" : "UNAUTHORIZED",
        },
        {
          status: auth.rateLimited ? 429 : 401,
          headers,
        }
      );
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "single";

    let results;
    let endpoint = "/v1/monitor";

    if (action === "batch") {
      // Batch monitoring
      const validation = batchMonitorSchema.safeParse(body);
      if (!validation.success) {
        throw new ValidationError(
          `Invalid batch request: ${validation.error.issues.map(i => i.message).join(", ")}`
        );
      }

      const { domains, checks, saveResults } = validation.data;
      endpoint = "/v1/monitor?action=batch";

      // Check permissions for batch operations
      if (!auth.apiKey!.permissions.includes("admin") && domains.length > 5) {
        throw new ValidationError(
          "Admin permission required for batch requests with more than 5 domains"
        );
      }

      results = await Promise.allSettled(
        domains.map(domain => monitorDomain(domain, checks, saveResults))
      );

      const successfulResults = results
        .filter(
          (result): result is PromiseFulfilledResult<any> =>
            result.status === "fulfilled"
        )
        .map(result => result.value);

      const failedResults = results
        .filter(
          (result): result is PromiseRejectedResult =>
            result.status === "rejected"
        )
        .map((result, index) => ({
          domain: domains[index],
          error: result.reason?.message || "Unknown error",
        }));

      results = {
        successful: successfulResults,
        failed: failedResults,
        total: domains.length,
        successCount: successfulResults.length,
        failureCount: failedResults.length,
      };
    } else {
      // Single domain monitoring
      const validation = monitorRequestSchema.safeParse(body);
      if (!validation.success) {
        throw new ValidationError(
          `Invalid request: ${validation.error.issues.map(i => i.message).join(", ")}`
        );
      }

      const { domain, checks, saveResults } = validation.data;

      // Normalize domain
      const normalizedDomain = domain
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .split("/")[0]
        .split("?")[0]
        .split("#")[0]
        .split(":")[0];

      results = await monitorDomain(normalizedDomain, checks, saveResults);
    }

    const responseTime = Date.now() - startTime;

    // Log API usage
    const apiManager = ApiKeyManager.getInstance();
    apiManager.logApiUsage(
      auth.apiKey!,
      endpoint,
      "POST",
      responseTime,
      200,
      request.headers.get("user-agent") || undefined,
      request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        undefined
    );

    // Add rate limit headers
    const headers = {
      "X-RateLimit-Limit": auth.apiKey!.rateLimit.toString(),
      "X-RateLimit-Remaining": auth.remainingRequests?.toString() || "0",
      "X-Response-Time": `${responseTime}ms`,
    };

    return NextResponse.json(
      {
        success: true,
        data: results,
        meta: {
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`,
          apiVersion: "v1",
        },
      },
      { headers }
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;

    // Log failed API usage if we have auth
    const auth = authenticateApiRequest(request);
    if (auth.authenticated) {
      const apiManager = ApiKeyManager.getInstance();
      apiManager.logApiUsage(
        auth.apiKey!,
        "/v1/monitor",
        "POST",
        responseTime,
        500,
        request.headers.get("user-agent") || undefined,
        request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          undefined
      );
    }

    return handleApiError(error, request.url);
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authenticate API request
    const auth = authenticateApiRequest(request);

    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.rateLimited ? 429 : 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");
    const action = searchParams.get("action") || "quick";

    if (!domain) {
      throw new ValidationError("Domain parameter is required");
    }

    // Validate domain
    const domainValidation = z
      .string()
      .regex(
        /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
        "Invalid domain format"
      )
      .safeParse(domain);

    if (!domainValidation.success) {
      throw new ValidationError("Invalid domain format");
    }

    // Normalize domain
    const normalizedDomain = domain
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      .split("?")[0]
      .split("#")[0]
      .split(":")[0];

    let results;
    let checks: ("certificate" | "security" | "performance")[];

    switch (action) {
      case "certificate":
        checks = ["certificate"];
        break;
      case "security":
        checks = ["security"];
        break;
      case "performance":
        checks = ["performance"];
        break;
      default:
        checks = ["certificate", "security", "performance"];
    }

    results = await monitorDomain(normalizedDomain, checks, false);

    const responseTime = Date.now() - startTime;

    // Log API usage
    const apiManager = ApiKeyManager.getInstance();
    apiManager.logApiUsage(
      auth.apiKey!,
      `/v1/monitor?action=${action}`,
      "GET",
      responseTime,
      200,
      request.headers.get("user-agent") || undefined,
      request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        undefined
    );

    const headers = {
      "X-RateLimit-Limit": auth.apiKey!.rateLimit.toString(),
      "X-RateLimit-Remaining": auth.remainingRequests?.toString() || "0",
      "X-Response-Time": `${responseTime}ms`,
    };

    return NextResponse.json(
      {
        success: true,
        data: results,
        meta: {
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`,
          apiVersion: "v1",
        },
      },
      { headers }
    );
  } catch (error) {
    return handleApiError(error, request.url);
  }
}

// Helper function to monitor a single domain
async function monitorDomain(
  domain: string,
  checks: ("certificate" | "security" | "performance")[],
  saveResults: boolean
) {
  const results: any = {
    domain,
    timestamp: new Date().toISOString(),
  };

  const promises: Promise<void>[] = [];

  // SSL Certificate check
  if (checks.includes("certificate")) {
    promises.push(
      getSSLInfo(domain).then(certInfo => {
        results.certificate = certInfo;

        if (saveResults) {
          const storage = DataStorageService.getInstance();
          const status = certInfo.valid
            ? certInfo.daysUntilExpiry !== undefined &&
              certInfo.daysUntilExpiry <= 30
              ? "warning"
              : "healthy"
            : "critical";
          storage.saveMonitoringData(domain, "certificate", certInfo, status);
        }
      })
    );
  }

  // Security Headers check
  if (checks.includes("security")) {
    promises.push(
      SecurityHeadersAnalyzer.analyzeSecurityHeaders(domain).then(
        securityInfo => {
          results.security = securityInfo;

          if (saveResults) {
            const storage = DataStorageService.getInstance();
            const status =
              securityInfo.grade === "A+" || securityInfo.grade === "A"
                ? "healthy"
                : securityInfo.grade === "B" || securityInfo.grade === "C"
                  ? "warning"
                  : "critical";
            storage.saveMonitoringData(
              domain,
              "security",
              securityInfo,
              status
            );
          }
        }
      )
    );
  }

  // Performance check
  if (checks.includes("performance")) {
    promises.push(
      PerformanceMonitor.measurePerformance(domain).then(perfInfo => {
        results.performance = perfInfo;
        const analysis = PerformanceMonitor.analyzePerformance(perfInfo);
        results.performance.analysis = analysis;

        if (saveResults) {
          const storage = DataStorageService.getInstance();
          storage.saveMonitoringData(
            domain,
            "performance",
            perfInfo,
            analysis.status
          );
        }
      })
    );
  }

  await Promise.allSettled(promises);

  // Calculate overall status
  const statuses: string[] = [];
  if (results.certificate) {
    statuses.push(results.certificate.valid ? "healthy" : "critical");
  }
  if (results.security) {
    statuses.push(
      ["A+", "A"].includes(results.security.grade)
        ? "healthy"
        : ["B", "C"].includes(results.security.grade)
          ? "warning"
          : "critical"
    );
  }
  if (results.performance && results.performance.analysis) {
    statuses.push(results.performance.analysis.status);
  }

  results.overallStatus = statuses.includes("critical")
    ? "critical"
    : statuses.includes("warning")
      ? "warning"
      : "healthy";

  return results;
}
