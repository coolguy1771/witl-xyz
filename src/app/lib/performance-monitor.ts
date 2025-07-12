import { PerformanceMetrics, PerformanceThresholds } from "@/types/monitoring";

export class PerformanceMonitor {
  private static readonly DEFAULT_THRESHOLDS: PerformanceThresholds = {
    responseTime: { warning: 2000, critical: 5000 },
    firstByteTime: { warning: 1000, critical: 3000 },
    availability: { warning: 95, critical: 90 },
  };

  public static async measurePerformance(
    domain: string,
    location: string = "client",
    timeout: number = 15000
  ): Promise<PerformanceMetrics> {
    const startTime = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // DNS lookup timing (simulate)
      const dnsStart = performance.now();
      // In a real implementation, you'd measure actual DNS lookup time
      const dnsEnd = performance.now();
      const dnsLookupTime = dnsEnd - dnsStart;

      // Connection timing
      const connectionStart = performance.now();

      const response = await fetch(`https://${domain}`, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "User-Agent": "Performance-Monitor/1.0",
          "Cache-Control": "no-cache",
        },
      });

      const connectionEnd = performance.now();
      const firstByteTime = connectionEnd - connectionStart;

      // Download timing
      const downloadStart = performance.now();
      const responseText = await response.text();
      const downloadEnd = performance.now();
      const downloadTime = downloadEnd - downloadStart;

      const totalTime = performance.now() - startTime;
      const responseTime = connectionEnd - connectionStart;

      clearTimeout(timeoutId);

      // Count redirects from response
      let redirectCount = 0;
      if (response.redirected) {
        // Estimate redirect count (could be more accurate with fetch interceptors)
        redirectCount = 1;
      }

      return {
        domain,
        timestamp: new Date().toISOString(),
        metrics: {
          responseTime: Math.round(responseTime),
          firstByteTime: Math.round(firstByteTime),
          dnsLookupTime: Math.round(dnsLookupTime),
          connectionTime: Math.round(connectionEnd - connectionStart),
          downloadTime: Math.round(downloadTime),
          totalTime: Math.round(totalTime),
        },
        httpStatus: response.status,
        contentSize: new Blob([responseText]).size,
        redirectCount,
        fromCache: this.isFromCache(response),
        location,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      const totalTime = performance.now() - startTime;

      // Return error metrics
      return {
        domain,
        timestamp: new Date().toISOString(),
        metrics: {
          responseTime: -1,
          firstByteTime: -1,
          dnsLookupTime: -1,
          connectionTime: -1,
          downloadTime: -1,
          totalTime: Math.round(totalTime),
        },
        httpStatus: 0,
        contentSize: 0,
        redirectCount: 0,
        fromCache: false,
        location,
      };
    }
  }

  public static async measureMultipleLocations(
    domain: string,
    locations: string[] = ["client"]
  ): Promise<PerformanceMetrics[]> {
    const promises = locations.map(location =>
      this.measurePerformance(domain, location)
    );

    const results = await Promise.allSettled(promises);

    return results
      .filter(
        (result): result is PromiseFulfilledResult<PerformanceMetrics> =>
          result.status === "fulfilled"
      )
      .map(result => result.value);
  }

  public static analyzePerformance(
    metrics: PerformanceMetrics,
    thresholds: PerformanceThresholds = this.DEFAULT_THRESHOLDS
  ): {
    status: "healthy" | "warning" | "critical";
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let status: "healthy" | "warning" | "critical" = "healthy";

    // Analyze response time
    if (metrics.metrics.responseTime > 0) {
      if (metrics.metrics.responseTime > thresholds.responseTime.critical) {
        status = "critical";
        issues.push(
          `Response time (${metrics.metrics.responseTime}ms) exceeds critical threshold`
        );
        recommendations.push(
          "Optimize server response time and consider using a CDN"
        );
      } else if (
        metrics.metrics.responseTime > thresholds.responseTime.warning
      ) {
        if (status !== "critical") status = "warning";
        issues.push(
          `Response time (${metrics.metrics.responseTime}ms) exceeds warning threshold`
        );
        recommendations.push("Consider optimizing server performance");
      }
    } else {
      status = "critical";
      issues.push(
        "Failed to measure response time - server may be unreachable"
      );
      recommendations.push("Check server availability and DNS configuration");
    }

    // Analyze TTFB
    if (metrics.metrics.firstByteTime > 0) {
      if (metrics.metrics.firstByteTime > thresholds.firstByteTime.critical) {
        status = "critical";
        issues.push(
          `Time to First Byte (${metrics.metrics.firstByteTime}ms) is too high`
        );
        recommendations.push(
          "Optimize server processing time and database queries"
        );
      } else if (
        metrics.metrics.firstByteTime > thresholds.firstByteTime.warning
      ) {
        if (status !== "critical") status = "warning";
        issues.push(
          `Time to First Byte (${metrics.metrics.firstByteTime}ms) could be improved`
        );
        recommendations.push("Review server-side performance optimizations");
      }
    }

    // Analyze HTTP status
    if (metrics.httpStatus >= 400) {
      status = "critical";
      issues.push(`HTTP error status: ${metrics.httpStatus}`);
      recommendations.push(
        "Fix server errors and ensure proper error handling"
      );
    } else if (metrics.httpStatus >= 300 && metrics.httpStatus < 400) {
      if (status === "healthy") status = "warning";
      issues.push(`HTTP redirect status: ${metrics.httpStatus}`);
      recommendations.push("Consider reducing redirect chains");
    }

    // Analyze content size
    if (metrics.contentSize > 2 * 1024 * 1024) {
      // 2MB
      if (status === "healthy") status = "warning";
      issues.push(
        `Large content size: ${(metrics.contentSize / 1024 / 1024).toFixed(2)}MB`
      );
      recommendations.push(
        "Consider enabling compression and optimizing content size"
      );
    }

    // Analyze redirects
    if (metrics.redirectCount > 3) {
      if (status === "healthy") status = "warning";
      issues.push(`Too many redirects: ${metrics.redirectCount}`);
      recommendations.push("Minimize redirect chains to improve performance");
    }

    return { status, issues, recommendations };
  }

  public static calculateAverageMetrics(
    metricsArray: PerformanceMetrics[]
  ): PerformanceMetrics | null {
    if (metricsArray.length === 0) return null;

    const validMetrics = metricsArray.filter(m => m.metrics.responseTime > 0);
    if (validMetrics.length === 0) return null;

    const avg = {
      responseTime: this.average(validMetrics.map(m => m.metrics.responseTime)),
      firstByteTime: this.average(
        validMetrics.map(m => m.metrics.firstByteTime)
      ),
      dnsLookupTime: this.average(
        validMetrics.map(m => m.metrics.dnsLookupTime)
      ),
      connectionTime: this.average(
        validMetrics.map(m => m.metrics.connectionTime)
      ),
      downloadTime: this.average(validMetrics.map(m => m.metrics.downloadTime)),
      totalTime: this.average(validMetrics.map(m => m.metrics.totalTime)),
    };

    return {
      domain: metricsArray[0].domain,
      timestamp: new Date().toISOString(),
      metrics: avg,
      httpStatus: this.mostCommon(validMetrics.map(m => m.httpStatus)),
      contentSize: this.average(validMetrics.map(m => m.contentSize)),
      redirectCount: this.average(validMetrics.map(m => m.redirectCount)),
      fromCache: false,
      location: "average",
    };
  }

  public static generatePerformanceReport(
    domain: string,
    metricsHistory: PerformanceMetrics[],
    thresholds?: PerformanceThresholds
  ): {
    summary: {
      totalTests: number;
      successRate: number;
      averageResponseTime: number;
      averageFirstByteTime: number;
    };
    trends: {
      responseTimeImproving: boolean;
      availabilityTrend: "improving" | "stable" | "degrading";
    };
    recommendations: string[];
  } {
    const validMetrics = metricsHistory.filter(m => m.metrics.responseTime > 0);
    const successRate = (validMetrics.length / metricsHistory.length) * 100;

    const avgResponseTime =
      validMetrics.length > 0
        ? this.average(validMetrics.map(m => m.metrics.responseTime))
        : 0;

    const avgFirstByteTime =
      validMetrics.length > 0
        ? this.average(validMetrics.map(m => m.metrics.firstByteTime))
        : 0;

    // Simple trend analysis (compare first half vs second half)
    const midPoint = Math.floor(validMetrics.length / 2);
    const firstHalf = validMetrics.slice(0, midPoint);
    const secondHalf = validMetrics.slice(midPoint);

    const firstHalfAvg =
      firstHalf.length > 0
        ? this.average(firstHalf.map(m => m.metrics.responseTime))
        : 0;

    const secondHalfAvg =
      secondHalf.length > 0
        ? this.average(secondHalf.map(m => m.metrics.responseTime))
        : 0;

    const responseTimeImproving =
      secondHalfAvg < firstHalfAvg && firstHalfAvg > 0;

    let availabilityTrend: "improving" | "stable" | "degrading" = "stable";
    if (successRate > 98) {
      availabilityTrend = "stable";
    } else if (successRate > 95) {
      availabilityTrend = "degrading";
    } else {
      availabilityTrend = "degrading";
    }

    const recommendations: string[] = [];

    if (successRate < 99) {
      recommendations.push("Improve server reliability and uptime monitoring");
    }

    if (avgResponseTime > 2000) {
      recommendations.push("Optimize server response times");
    }

    if (avgFirstByteTime > 1000) {
      recommendations.push("Reduce Time to First Byte (TTFB)");
    }

    return {
      summary: {
        totalTests: metricsHistory.length,
        successRate: Math.round(successRate * 100) / 100,
        averageResponseTime: Math.round(avgResponseTime),
        averageFirstByteTime: Math.round(avgFirstByteTime),
      },
      trends: {
        responseTimeImproving,
        availabilityTrend,
      },
      recommendations,
    };
  }

  private static isFromCache(response: Response): boolean {
    // Check various cache indicators
    const cacheControl = response.headers.get("cache-control");
    const age = response.headers.get("age");
    const cfCacheStatus = response.headers.get("cf-cache-status");

    return (
      !!(cfCacheStatus && cfCacheStatus !== "MISS") ||
      !!(age && parseInt(age) > 0) ||
      !!(cacheControl && !cacheControl.includes("no-cache"))
    );
  }

  private static average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return Math.round(
      numbers.reduce((sum, num) => sum + num, 0) / numbers.length
    );
  }

  private static mostCommon<T>(array: T[]): T {
    if (array.length === 0) return array[0];

    const counts = new Map<T, number>();
    array.forEach(item => {
      counts.set(item, (counts.get(item) || 0) + 1);
    });

    let maxCount = 0;
    let mostCommon = array[0];

    counts.forEach((count, item) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = item;
      }
    });

    return mostCommon;
  }
}
