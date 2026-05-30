import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware that attaches a set of security-focused HTTP headers to the response for matched routes.
 *
 * Sets Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy,
 * and Permissions-Policy; also sets Strict-Transport-Security when NODE_ENV is "production".
 *
 * @returns The passthrough NextResponse with the security headers applied
 */
export function middleware(_request: NextRequest) {
  const response = NextResponse.next();
  const headers = response.headers;

  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://api.github.com; frame-ancestors 'none';"
  );
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-XSS-Protection", "1; mode=block");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  if (process.env.NODE_ENV === "production") {
    headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/|api/).*)",
  ],
};
