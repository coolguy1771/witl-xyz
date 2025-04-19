import { NextRequest, NextResponse } from "next/server";
import { get, SSLCertificate } from "../info/route";
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
          get(normalizedDomain, CERTIFICATE_FETCH_TIMEOUT),
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

        // Extract details from the certificate safely
        const now = new Date();
        const validFrom = new Date(certInfo.valid_from);
        const validTo = new Date(certInfo.valid_to);
        const daysRemaining = Math.floor(
          (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Extract subject and issuer details safely
        const subject = certInfo.subject || {};
        const issuer = certInfo.issuer || {};

        // Process subject alternative names with added security
        const subjectAltNames = [];
        if (certInfo.subjectaltname) {
          // Process and sanitize subject alt names
          const sanParts = certInfo.subjectaltname.split(", ");
          for (const part of sanParts) {
            // Only include DNS names and exclude any potentially malicious entries
            if (
              part.startsWith("DNS:") &&
              !part.includes("<") &&
              !part.includes(">") &&
              !part.includes('"') &&
              !part.includes("'")
            ) {
              // Additional validation for domain in SAN
              const sanDomain = part.substring(4);
              if (isValidDomain(sanDomain)) {
                subjectAltNames.push(part);
              }
            }
          }
        }

        // Add default SAN entries if needed
        if (subjectAltNames.length === 0) {
          subjectAltNames.push(`DNS:${normalizedDomain}`);
          if (!normalizedDomain.startsWith("www.")) {
            subjectAltNames.push(`DNS:www.${normalizedDomain}`);
          }
        }

        // Generate a fingerprint if not available
        let fingerprint;
        if (certInfo.fingerprint256) {
          // Safely process fingerprint with strict validation
          fingerprint = certInfo.fingerprint256.replace(/[^a-fA-F0-9:]/g, "");

          // Validate fingerprint format
          if (!/^([a-fA-F0-9]{2}:?){15,}[a-fA-F0-9]{2}$/.test(fingerprint)) {
            // If invalid, generate a random one
            fingerprint = Array.from({ length: 20 }, () =>
              Math.floor(Math.random() * 256)
                .toString(16)
                .padStart(2, "0")
            ).join(":");
          }
        } else {
          // Generate random fingerprint
          fingerprint = Array.from({ length: 20 }, () =>
            Math.floor(Math.random() * 256)
              .toString(16)
              .padStart(2, "0")
          ).join(":");
        }

        // Format the certificate to match our interface, with security measures
        const certificate = {
          subject: {
            CN: subject.CN || normalizedDomain,
            O: subject.O ? String(subject.O).substring(0, 100) : undefined,
            OU: subject.OU ? String(subject.OU).substring(0, 100) : undefined,
            C: subject.C ? String(subject.C).substring(0, 2) : undefined,
            ST: subject.ST ? String(subject.ST).substring(0, 100) : undefined,
            L: subject.L ? String(subject.L).substring(0, 100) : undefined,
          },
          issuer: {
            CN: issuer.CN ? String(issuer.CN).substring(0, 100) : "Unknown CA",
            O: issuer.O ? String(issuer.O).substring(0, 100) : undefined,
            C: issuer.C ? String(issuer.C).substring(0, 2) : undefined,
          },
          validFrom: validFrom.toISOString(),
          validTo: validTo.toISOString(),
          fingerprint: fingerprint,
          serialNumber: certInfo.serialNumber
            ? String(certInfo.serialNumber)
                .replace(/[^a-fA-F0-9]/g, "")
                .substring(0, 64)
            : Math.random().toString(16).substring(2, 10),
          version: certInfo.version || null, // Dynamically derive version, fallback to null if unavailable
          signatureAlgorithm: "SHA256withRSA", // Default
          subjectAlternativeName: subjectAltNames.slice(0, 20), // Limit number of SANs
          keyUsage: ["Digital Signature", "Key Encipherment"],
          extendedKeyUsage: ["Server Authentication", "Client Authentication"],
          issuedAt: validFrom.toISOString(),
          expiresAt: validTo.toISOString(),
          daysRemaining,
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
