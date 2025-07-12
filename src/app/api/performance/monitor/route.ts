import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PerformanceMonitor } from "@/app/lib/performance-monitor";
import { handleApiError, ValidationError } from "@/app/lib/error-handler";

const performanceTestSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain is required")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
      "Invalid domain format"
    ),
  locations: z.array(z.string()).optional().default(["client"]),
  timeout: z.number().min(1000).max(30000).optional().default(15000),
});

const performanceReportSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain is required")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
      "Invalid domain format"
    ),
  days: z.number().min(1).max(90).optional().default(7),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "test";

    if (action === "report") {
      const validation = performanceReportSchema.safeParse(body);
      if (!validation.success) {
        throw new ValidationError(
          `Invalid report request: ${validation.error.issues.map(i => i.message).join(", ")}`
        );
      }

      const { domain, days } = validation.data;

      // In a real implementation, you'd fetch historical data from a database
      // For now, we'll generate a sample report
      const sampleMetrics = await PerformanceMonitor.measurePerformance(domain);
      const report = PerformanceMonitor.generatePerformanceReport(
        domain,
        [sampleMetrics] // In reality, this would be historical data
      );

      return NextResponse.json({
        success: true,
        data: {
          domain,
          period: `${days} days`,
          report,
          note: "This is a sample report. Historical data storage would be implemented in production.",
        },
      });
    }

    // Default action: performance test
    const validation = performanceTestSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(
        `Invalid test request: ${validation.error.issues.map(i => i.message).join(", ")}`
      );
    }

    const { domain, locations, timeout } = validation.data;

    // Normalize domain
    const normalizedDomain = domain
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      .split("?")[0]
      .split("#")[0]
      .split(":")[0];

    // Run performance tests
    const results = await PerformanceMonitor.measureMultipleLocations(
      normalizedDomain,
      locations
    );

    // Analyze each result
    const analysis = results.map(metrics => ({
      metrics,
      analysis: PerformanceMonitor.analyzePerformance(metrics),
    }));

    // Calculate average if multiple locations
    const averageMetrics =
      results.length > 1
        ? PerformanceMonitor.calculateAverageMetrics(results)
        : null;

    return NextResponse.json({
      success: true,
      data: {
        domain: normalizedDomain,
        timestamp: new Date().toISOString(),
        results: analysis,
        average: averageMetrics
          ? {
              metrics: averageMetrics,
              analysis: PerformanceMonitor.analyzePerformance(averageMetrics),
            }
          : null,
        summary: {
          totalTests: results.length,
          successfulTests: results.filter(r => r.metrics.responseTime > 0)
            .length,
          averageResponseTime: averageMetrics?.metrics.responseTime || 0,
          fastestLocation:
            results.length > 1
              ? results.reduce((fastest, current) =>
                  current.metrics.responseTime > 0 &&
                  (fastest.metrics.responseTime <= 0 ||
                    current.metrics.responseTime < fastest.metrics.responseTime)
                    ? current
                    : fastest
                ).location
              : results[0]?.location,
        },
      },
    });
  } catch (error) {
    return handleApiError(error, request.url);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");
    const action = searchParams.get("action") || "test";

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

    if (action === "quick") {
      // Quick single-location test
      const metrics =
        await PerformanceMonitor.measurePerformance(normalizedDomain);
      const analysis = PerformanceMonitor.analyzePerformance(metrics);

      return NextResponse.json({
        success: true,
        data: {
          domain: normalizedDomain,
          timestamp: new Date().toISOString(),
          metrics,
          analysis,
        },
      });
    }

    // Default: comprehensive test
    const results =
      await PerformanceMonitor.measureMultipleLocations(normalizedDomain);
    const analysis = results.map(metrics => ({
      metrics,
      analysis: PerformanceMonitor.analyzePerformance(metrics),
    }));

    return NextResponse.json({
      success: true,
      data: {
        domain: normalizedDomain,
        timestamp: new Date().toISOString(),
        results: analysis,
      },
    });
  } catch (error) {
    return handleApiError(error, request.url);
  }
}
