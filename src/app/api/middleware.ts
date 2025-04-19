import { NextResponse, NextRequest } from "next/server";
import { rateLimiter } from "./rate-limiter";

/**
 * Middleware for API routes to add security headers and implement rate limiting
 */
export async function apiMiddleware(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("cf-connecting-ip") ||
    request.ip ||
    "unknown";

  // Rate limiting based on IP
  const rateLimited = await rateLimiter.check(ip);
  if (rateLimited) {
    return new NextResponse(
      JSON.stringify({ error: "Too many requests, please try again later" }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
        },
      }
    );
  }

  // Add security headers to all API responses
  const response = NextResponse.next();

  // Add security headers
  const headers = new Headers(response.headers);
  headers.set("Content-Security-Policy", "default-src 'self'");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("X-XSS-Protection", "1; mode=block");

  // Set CORS headers for API routes
  headers.set(
    "Access-Control-Allow-Origin",
    process.env.NODE_ENV === "production"
      ? "https://witl.xyz"
      : "http://localhost:3000"
  );
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Max-Age", "86400"); // 24 hours

  return NextResponse.next({
    request: {
      headers: request.headers,
    },
    headers,
  });
}
