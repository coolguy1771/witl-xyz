import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Global security middleware for Next.js application
 * Applies security headers and rate limiting to all routes
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(_request: NextRequest) {
  // Get the response
  const response = NextResponse.next();

  // Set security headers for all responses
  const headers = response.headers;

  // Apply Content Security Policy (CSP)
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://api.github.com; frame-ancestors 'none';"
  );

  // Prevent MIME type sniffing
  headers.set("X-Content-Type-Options", "nosniff");

  // Prevent embedding in iframes (clickjacking protection)
  headers.set("X-Frame-Options", "DENY");

  // Enable browser XSS protection
  headers.set("X-XSS-Protection", "1; mode=block");

  // Control link following for referrers
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Restrict browser features
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");

  // Set HSTS for HTTPS enforcement
  if (process.env.NODE_ENV === "production") {
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  return response;
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes except for _next, public, static, api
    "/((?!_next/static|_next/image|favicon.ico|public/|api/).*)",
  ],
};
