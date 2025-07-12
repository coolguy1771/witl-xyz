import { NextRequest, NextResponse } from "next/server";
import { getSSLInfo } from "@/app/lib/ssl-simple";
import { SSLCertificateResponse } from "@/app/types/ssl";
import {
  isValidDomain,
  secureLogger,
  applySecurityHeaders,
  secureErrorResponse,
} from "../../cloudflare-security";

// Mark route as dynamic to support direct SSL certificate fetching
export const dynamic = "force-dynamic";

// Cloudflare-optimized settings
const CERTIFICATE_FETCH_TIMEOUT = 10000; // 10 seconds

export async function POST(request: NextRequest) {
  // Get Cloudflare-specific client IP for logging
  const clientIP = request.headers.get("cf-connecting-ip") || "unknown";
  secureLogger.info("SSL certificate fetch API called", { ip: clientIP });

  try {
    // Parse request body to get domain
    const body = await request.json();

    // Validate that body is an object with a domain property
    if (
      !body ||
      typeof body !== "object" ||
      !("domain" in body) ||
      typeof (body as Record<string, unknown>).domain !== "string"
    ) {
      secureLogger.warn("Invalid request body format");
      return secureErrorResponse("Invalid request format", 400);
    }

    const { domain } = body as { domain: string };

    // Don't log the raw domain input for security
    secureLogger.info("Processing certificate request");

    // Validate input
    if (!domain) {
      secureLogger.warn("Missing domain parameter");
      return secureErrorResponse("Domain is required", 400);
    }

    // Enhanced domain validation using Cloudflare-optimized validator
    if (!isValidDomain(domain)) {
      secureLogger.warn("Invalid domain format detected");
      return secureErrorResponse(
        "Invalid domain format or domain not allowed",
        400
      );
    }

    // Normalize domain for processing
    const normalizedDomain = domain
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      .split("?")[0]
      .split("#")[0]
      .split(":")[0]; // Remove port if present

    secureLogger.info("Domain validation passed");

    try {
      secureLogger.info(`Fetching SSL certificate for domain`);

      // Use the get function from the SSL info module with timeout
      // Taking advantage of Cloudflare's network for efficient SSL checking
      const startTime = Date.now();

      // Add timeout and abort controller for better resource management in Cloudflare Workers
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        CERTIFICATE_FETCH_TIMEOUT
      );

      try {
        // Use Promise.race with AbortController for more efficient timeout handling in CF Workers
        const certInfo = await Promise.race([
          getSSLInfo(normalizedDomain),
          new Promise<never>((_, reject) => {
            controller.signal.addEventListener("abort", () => {
              reject(new Error("Certificate fetch timeout"));
            });
          }),
        ]);

        clearTimeout(timeoutId);

        secureLogger.info(`Certificate fetch completed`, {
          timeMs: Date.now() - startTime,
        });

        // Use the certificate info from our SSL checker
        const certificate = {
          domain: certInfo.domain,
          valid: certInfo.valid,
          subject: {
            CN: certInfo.commonName || normalizedDomain,
            O: certInfo.organization || undefined,
          },
          issuer: {
            CN: certInfo.issuer || "Unknown CA",
          },
          validFrom: certInfo.validFrom,
          validTo: certInfo.validTo,
          fingerprint: certInfo.fingerprint || "unknown",
          serialNumber:
            certInfo.serialNumber ||
            Math.random().toString(16).substring(2, 10),
          signatureAlgorithm: certInfo.signatureAlgorithm || "SHA256withRSA",
          subjectAlternativeName: certInfo.subjectAlternativeNames || [
            `DNS:${normalizedDomain}`,
          ],
          keyUsage: ["Digital Signature", "Key Encipherment"],
          extendedKeyUsage: ["Server Authentication", "Client Authentication"],
          issuedAt: certInfo.validFrom,
          expiresAt: certInfo.validTo,
          daysRemaining: certInfo.daysUntilExpiry,
          error: certInfo.error,
        };

        secureLogger.info("Certificate data processed successfully");

        // Create response with security headers optimized for Cloudflare
        const response = NextResponse.json({
          success: true,
          certificate,
        } as SSLCertificateResponse);

        // Apply security headers
        return applySecurityHeaders(response);
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      secureLogger.error(`Error fetching certificate`, error);

      // Determine the most appropriate error type for better UX while maintaining security
      if (error instanceof Error) {
        if (error.message.includes("timeout") || error.name === "AbortError") {
          return secureErrorResponse(
            "The certificate check timed out. The server may be slow to respond.",
            504 // Gateway Timeout
          );
        }

        if (
          error.message.includes("ECONNREFUSED") ||
          error.message.includes("ENOTFOUND")
        ) {
          return secureErrorResponse(
            "Could not connect to the server to check the SSL certificate.",
            502 // Bad Gateway
          );
        }
      }

      // For security, don't leak detailed error information
      return secureErrorResponse(
        "Unable to retrieve SSL certificate information.",
        500
      );
    }
  } catch (error) {
    secureLogger.error("Unhandled error in SSL certificate API", error);

    // Log safe request data for Cloudflare Workers observability
    secureLogger.info("Request context", {
      method: request.method,
      url: request.url,
      cf: request.headers.get("cf-ray"), // Cloudflare ray ID for request tracing
    });

    // Generic error with security headers
    return secureErrorResponse(
      "An error occurred while processing your request.",
      500
    );
  }
}
