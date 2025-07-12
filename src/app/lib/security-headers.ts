import { SecurityHeader, SecurityHeadersAnalysis } from "@/types/monitoring";

export class SecurityHeadersAnalyzer {
  private static readonly SECURITY_HEADERS = {
    "strict-transport-security": {
      name: "HTTP Strict Transport Security (HSTS)",
      description: "Enforces secure HTTPS connections",
      weight: 20,
    },
    "content-security-policy": {
      name: "Content Security Policy (CSP)",
      description: "Prevents XSS and data injection attacks",
      weight: 25,
    },
    "x-frame-options": {
      name: "X-Frame-Options",
      description: "Prevents clickjacking attacks",
      weight: 15,
    },
    "x-content-type-options": {
      name: "X-Content-Type-Options",
      description: "Prevents MIME type sniffing",
      weight: 10,
    },
    "x-xss-protection": {
      name: "X-XSS-Protection",
      description: "Enables XSS filtering in browsers",
      weight: 10,
    },
    "referrer-policy": {
      name: "Referrer Policy",
      description: "Controls referrer information sent with requests",
      weight: 10,
    },
    "permissions-policy": {
      name: "Permissions Policy",
      description: "Controls browser feature permissions",
      weight: 10,
    },
  };

  public static async analyzeSecurityHeaders(
    domain: string
  ): Promise<SecurityHeadersAnalysis> {
    try {
      // Fetch the domain to analyze headers
      const response = await fetch(`https://${domain}`, {
        method: "HEAD",
        headers: {
          "User-Agent": "Security-Headers-Analyzer/1.0",
        },
        signal: AbortSignal.timeout(10000),
      });

      const headers = this.extractHeaders(response);
      const analysis = this.analyzeHeaders(headers);
      const score = this.calculateScore(analysis);
      const grade = this.calculateGrade(score);
      const recommendations = this.generateRecommendations(analysis);
      const vulnerabilities = this.identifyVulnerabilities(analysis);

      return {
        domain,
        timestamp: new Date().toISOString(),
        overallScore: score,
        grade,
        headers: analysis,
        recommendations,
        vulnerabilities,
      };
    } catch (error) {
      console.error(`Failed to analyze security headers for ${domain}:`, error);

      // Return a default analysis indicating the check failed
      return {
        domain,
        timestamp: new Date().toISOString(),
        overallScore: 0,
        grade: "F",
        headers: this.getDefaultHeadersAnalysis(),
        recommendations: [
          "Unable to analyze security headers - domain may be unreachable",
        ],
        vulnerabilities: ["Could not verify security header implementation"],
      };
    }
  }

  private static extractHeaders(response: Response): Record<string, string> {
    const headers: Record<string, string> = {};

    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    return headers;
  }

  private static analyzeHeaders(
    headers: Record<string, string>
  ): SecurityHeadersAnalysis["headers"] {
    const analysis: SecurityHeadersAnalysis["headers"] =
      {} as SecurityHeadersAnalysis["headers"];

    // Analyze Strict-Transport-Security
    analysis["strict-transport-security"] = this.analyzeHSTS(
      headers["strict-transport-security"]
    );

    // Analyze Content-Security-Policy
    analysis["content-security-policy"] = this.analyzeCSP(
      headers["content-security-policy"]
    );

    // Analyze X-Frame-Options
    analysis["x-frame-options"] = this.analyzeXFrameOptions(
      headers["x-frame-options"]
    );

    // Analyze X-Content-Type-Options
    analysis["x-content-type-options"] = this.analyzeXContentTypeOptions(
      headers["x-content-type-options"]
    );

    // Analyze X-XSS-Protection
    analysis["x-xss-protection"] = this.analyzeXXSSProtection(
      headers["x-xss-protection"]
    );

    // Analyze Referrer-Policy
    analysis["referrer-policy"] = this.analyzeReferrerPolicy(
      headers["referrer-policy"]
    );

    // Analyze Permissions-Policy
    analysis["permissions-policy"] = this.analyzePermissionsPolicy(
      headers["permissions-policy"]
    );

    return analysis;
  }

  private static analyzeHSTS(value?: string): SecurityHeader {
    if (!value) {
      return {
        name: "Strict-Transport-Security",
        present: false,
        secure: false,
        severity: "error",
        recommendation:
          'Add HSTS header with max-age directive (e.g., "max-age=31536000; includeSubDomains")',
      };
    }

    const maxAge = value.match(/max-age=(\d+)/);
    const includeSubDomains = value.includes("includeSubDomains");
    const preload = value.includes("preload");

    let secure = true;
    let severity: SecurityHeader["severity"] = "info";
    let recommendation: string | undefined;

    if (!maxAge || parseInt(maxAge[1]) < 300) {
      secure = false;
      severity = "error";
      recommendation =
        "HSTS max-age should be at least 300 seconds (preferably 31536000)";
    } else if (parseInt(maxAge[1]) < 31536000) {
      severity = "warning";
      recommendation = "Consider increasing HSTS max-age to 31536000 (1 year)";
    }

    if (!includeSubDomains) {
      severity = severity === "error" ? "error" : "warning";
      recommendation =
        (recommendation || "") + " Consider adding includeSubDomains directive";
    }

    return {
      name: "Strict-Transport-Security",
      value,
      present: true,
      secure,
      severity,
      recommendation,
    };
  }

  private static analyzeCSP(value?: string): SecurityHeader {
    if (!value) {
      return {
        name: "Content-Security-Policy",
        present: false,
        secure: false,
        severity: "error",
        recommendation:
          "Implement Content Security Policy to prevent XSS attacks",
      };
    }

    const hasUnsafeInline = value.includes("'unsafe-inline'");
    const hasUnsafeEval = value.includes("'unsafe-eval'");
    const hasDefaultSrc = value.includes("default-src");
    const hasScriptSrc = value.includes("script-src");

    let secure = true;
    let severity: SecurityHeader["severity"] = "info";
    let recommendation: string | undefined;

    if (hasUnsafeInline || hasUnsafeEval) {
      secure = false;
      severity = "warning";
      recommendation = "Avoid using unsafe-inline and unsafe-eval in CSP";
    }

    if (!hasDefaultSrc && !hasScriptSrc) {
      severity = "warning";
      recommendation =
        (recommendation || "") +
        " Consider adding default-src or script-src directive";
    }

    return {
      name: "Content-Security-Policy",
      value,
      present: true,
      secure,
      severity,
      recommendation,
    };
  }

  private static analyzeXFrameOptions(value?: string): SecurityHeader {
    if (!value) {
      return {
        name: "X-Frame-Options",
        present: false,
        secure: false,
        severity: "warning",
        recommendation:
          "Add X-Frame-Options header (DENY or SAMEORIGIN) to prevent clickjacking",
      };
    }

    const validValues = ["DENY", "SAMEORIGIN"];
    const isValid = validValues.includes(value.toUpperCase());

    return {
      name: "X-Frame-Options",
      value,
      present: true,
      secure: isValid,
      severity: isValid ? "info" : "warning",
      recommendation: isValid
        ? undefined
        : "Use DENY or SAMEORIGIN for X-Frame-Options",
    };
  }

  private static analyzeXContentTypeOptions(value?: string): SecurityHeader {
    const expectedValue = "nosniff";
    const isCorrect = value?.toLowerCase() === expectedValue;

    return {
      name: "X-Content-Type-Options",
      value,
      present: !!value,
      secure: isCorrect,
      severity: isCorrect ? "info" : "warning",
      recommendation: isCorrect
        ? undefined
        : 'Set X-Content-Type-Options to "nosniff"',
    };
  }

  private static analyzeXXSSProtection(value?: string): SecurityHeader {
    if (!value) {
      return {
        name: "X-XSS-Protection",
        present: false,
        secure: false,
        severity: "info", // Less critical with modern CSP
        recommendation:
          "Consider adding X-XSS-Protection: 1; mode=block (though CSP is preferred)",
      };
    }

    const isValid = value === "1; mode=block" || value === "1";

    return {
      name: "X-XSS-Protection",
      value,
      present: true,
      secure: isValid,
      severity: "info",
      recommendation: isValid
        ? undefined
        : 'Use "1; mode=block" for X-XSS-Protection',
    };
  }

  private static analyzeReferrerPolicy(value?: string): SecurityHeader {
    if (!value) {
      return {
        name: "Referrer-Policy",
        present: false,
        secure: false,
        severity: "info",
        recommendation:
          'Consider adding Referrer-Policy header (e.g., "strict-origin-when-cross-origin")',
      };
    }

    const secureValues = [
      "no-referrer",
      "strict-origin",
      "strict-origin-when-cross-origin",
      "same-origin",
    ];

    const isSecure = secureValues.includes(value);

    return {
      name: "Referrer-Policy",
      value,
      present: true,
      secure: isSecure,
      severity: isSecure ? "info" : "warning",
      recommendation: isSecure
        ? undefined
        : "Use a more restrictive referrer policy",
    };
  }

  private static analyzePermissionsPolicy(value?: string): SecurityHeader {
    return {
      name: "Permissions-Policy",
      value,
      present: !!value,
      secure: !!value,
      severity: "info",
      recommendation: value
        ? undefined
        : "Consider adding Permissions-Policy to control browser features",
    };
  }

  private static calculateScore(
    headers: SecurityHeadersAnalysis["headers"]
  ): number {
    let totalScore = 0;
    let maxScore = 0;

    Object.entries(this.SECURITY_HEADERS).forEach(([key, config]) => {
      const header = headers[key as keyof typeof headers];
      maxScore += config.weight;

      if (header.present) {
        if (header.secure) {
          totalScore += config.weight;
        } else {
          // Partial credit for present but insecure headers
          totalScore += config.weight * 0.5;
        }
      }
    });

    return Math.round((totalScore / maxScore) * 100);
  }

  private static calculateGrade(
    score: number
  ): SecurityHeadersAnalysis["grade"] {
    if (score >= 95) return "A+";
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  }

  private static generateRecommendations(
    headers: SecurityHeadersAnalysis["headers"]
  ): string[] {
    const recommendations: string[] = [];

    Object.values(headers).forEach(header => {
      if (header.recommendation) {
        recommendations.push(header.recommendation);
      }
    });

    // Add general recommendations
    if (!headers["content-security-policy"].present) {
      recommendations.push("Implement a comprehensive Content Security Policy");
    }

    if (!headers["strict-transport-security"].present) {
      recommendations.push("Enable HSTS to enforce secure connections");
    }

    return recommendations;
  }

  private static identifyVulnerabilities(
    headers: SecurityHeadersAnalysis["headers"]
  ): string[] {
    const vulnerabilities: string[] = [];

    if (
      !headers["x-frame-options"].present &&
      !headers["content-security-policy"].present
    ) {
      vulnerabilities.push("Vulnerable to clickjacking attacks");
    }

    if (!headers["content-security-policy"].present) {
      vulnerabilities.push("Vulnerable to XSS attacks");
    }

    if (!headers["strict-transport-security"].present) {
      vulnerabilities.push("Vulnerable to man-in-the-middle attacks");
    }

    if (!headers["x-content-type-options"].present) {
      vulnerabilities.push("Vulnerable to MIME type confusion attacks");
    }

    return vulnerabilities;
  }

  private static getDefaultHeadersAnalysis(): SecurityHeadersAnalysis["headers"] {
    return {
      "strict-transport-security": {
        name: "Strict-Transport-Security",
        present: false,
        secure: false,
        severity: "error",
        recommendation: "Unable to check - domain unreachable",
      },
      "content-security-policy": {
        name: "Content-Security-Policy",
        present: false,
        secure: false,
        severity: "error",
        recommendation: "Unable to check - domain unreachable",
      },
      "x-frame-options": {
        name: "X-Frame-Options",
        present: false,
        secure: false,
        severity: "error",
        recommendation: "Unable to check - domain unreachable",
      },
      "x-content-type-options": {
        name: "X-Content-Type-Options",
        present: false,
        secure: false,
        severity: "error",
        recommendation: "Unable to check - domain unreachable",
      },
      "x-xss-protection": {
        name: "X-XSS-Protection",
        present: false,
        secure: false,
        severity: "error",
        recommendation: "Unable to check - domain unreachable",
      },
      "referrer-policy": {
        name: "Referrer-Policy",
        present: false,
        secure: false,
        severity: "error",
        recommendation: "Unable to check - domain unreachable",
      },
      "permissions-policy": {
        name: "Permissions-Policy",
        present: false,
        secure: false,
        severity: "error",
        recommendation: "Unable to check - domain unreachable",
      },
    };
  }
}
