/**
 * Security utilities optimized for Cloudflare Workers environment
 *
 * This module provides security functions specifically designed for
 * Cloudflare Workers, taking advantage of Cloudflare's built-in security features.
 */

import { NextResponse } from "next/server";

// Rate limiting using Cloudflare's worker-specific approach

/**
 * Securely log with built-in Cloudflare observability
 */
export const secureLogger = {
  // Redact sensitive information from logs
  redactSensitiveData(data: unknown): Record<string, unknown> | unknown[] | unknown {
    if (!data) return data;
    if (typeof data !== "object" || data === null) return data;

    // List of sensitive fields to redact
    const sensitiveFields = [
      "password",
      "token",
      "key",
      "secret",
      "auth",
      "cookie",
      "session",
      "jwt",
      "bearer",
      "credit",
      "card",
      "cvv",
      "ssn",
      "social",
      "private",
      "fingerprint",
      "passport",
    ];

    // Create a copy to avoid modifying the original
    const result: { [key: string]: unknown } | unknown[] = Array.isArray(data) ? [...data] : { ...data };

    for (const key in result) {
      const lowerKey = key.toLowerCase();

      // Check if field name contains sensitive information
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        (result as { [key: string]: unknown })[key] = "[REDACTED]";
      }
      // Recursively sanitize objects
      else if (typeof (result as { [key: string]: unknown })[key] === "object" && (result as { [key: string]: unknown })[key] !== null) {
        (result as { [key: string]: unknown })[key] = this.redactSensitiveData((result as { [key: string]: unknown })[key]);
      }
    }

    return result;
  },

  // Log message with Cloudflare observability
  info(message: string, data?: unknown): void {
    console.log(message, data ? this.redactSensitiveData(data) : "");
  },

  warn(message: string, data?: unknown): void {
    console.warn(message, data ? this.redactSensitiveData(data) : "");
  },

  error(message: string, error?: unknown): void {
    const safeError =
      error instanceof Error
        ? { name: error.name, message: error.message }
        : error;

    console.error(message, this.redactSensitiveData(safeError));
  },
};


/**
 * CORS configuration for GitHub API access
 */
export const corsConfig = {
  // Allowed origins
  allowedOrigins: ["https://api.github.com", "https://github.com"],
  // Default CORS settings
  defaultSettings: {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With, Accept",
    "Access-Control-Max-Age": "86400", // 24 hours
    "Access-Control-Allow-Credentials": "true",
  },
};

/**
 * Apply Cloudflare-specific security headers
 */
export function applySecurityHeaders(
  response: NextResponse,
  enableCors: boolean = false,
  origin?: string
): NextResponse {
  // Security headers with Cloudflare-specific optimizations
  const headers = response.headers;

  // Security headers (Cloudflare already sets some by default)
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy (CSP) - Allow GitHub API connections
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://api.github.com https://github.com"
  );

  // Permissions policy
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // Apply CORS headers if enabled
  if (enableCors) {
    // Determine if the origin is allowed
    const requestOrigin = origin || "*";
    const isAllowedOrigin =
      corsConfig.allowedOrigins.includes(requestOrigin) ||
      requestOrigin === "*";

    // Set CORS headers
    headers.set(
      "Access-Control-Allow-Origin",
      isAllowedOrigin ? requestOrigin : "*"
    );

    // Apply default CORS settings
    Object.entries(corsConfig.defaultSettings).forEach(([key, value]) => {
      headers.set(key, value);
    });
  }

  return response;
}

/**
 * Enhanced Cloudflare-specific error response with proper security headers
 */
export function secureErrorResponse(
  message: string,
  status: number = 500,
  details?: string
): NextResponse {
  const response = NextResponse.json(
    {
      error: message,
      details: process.env.NODE_ENV === "development" ? details : undefined,
    },
    { status }
  );

  return applySecurityHeaders(response);
}

/**
 * Domain validation specifically designed for SSL checking
 * Uses more permissive validation to work with international domains
 */
export function isValidDomain(domain: string): boolean {
  if (!domain || typeof domain !== "string") {
    return false;
  }

  // Remove protocols and paths
  const normalizedDomain = domain
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split("?")[0]
    .split("#")[0]
    .split(":")[0]; // Remove port if present

  // Block internal resources
  const blockedDomains = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "[::1]",
    ".local",
    ".internal",
    ".test",
    ".example",
    ".invalid",
    ".localhost",
  ];

  if (
    blockedDomains.some(
      blocked =>
        normalizedDomain === blocked || normalizedDomain.endsWith("." + blocked)
    )
  ) {
    return false;
  }

  const domainRegex =
    /^(([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]))\.([a-zA-Z]{2,6}|[a-zA-Z0-9-]{2,30}\.[a-zA-Z]{2,3})$/;

  return domainRegex.test(normalizedDomain);
}

/**
 * File size and type validation for uploads
 */
export function validateFileUpload(
  file: File,
  maxSizeBytes: number,
  allowedTypes: string[]
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  // Check file size
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${Math.floor(
        maxSizeBytes / 1024
      )} KB`,
    };
  }

  // Check MIME type if available and specified
  if (allowedTypes.length > 0 && file.type) {
    const isAllowedType = allowedTypes.some(
      type =>
        file.type === type || file.type.startsWith(type.replace(/\*/g, ""))
    );

    if (!isAllowedType) {
      return { valid: false, error: "Invalid file type" };
    }
  }

  return { valid: true };
}

/**
 * Sanitize certificate content to prevent security issues
 */
export function sanitizeCertificate(content: string): string {
  // Keep only the valid certificate content
  const certMatch = content.match(
    /-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g
  );

  if (!certMatch || certMatch.length === 0) {
    throw new Error("Invalid certificate format");
  }

  // Use only the first valid certificate block
  return certMatch[0];
}
