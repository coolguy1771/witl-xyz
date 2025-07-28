/**
 * API Middleware Configuration
 *
 * Centralized configuration for API security and rate limiting
 */

// Rate limiting configurations
export const rateLimitConfig = {
  // Default rate limit for all API routes
  default: {
    limit: 20,
    windowMs: 60 * 1000, // 1 minute
  },

  // Certificate-related routes
  ssl: {
    limit: 5,
    windowMs: 60 * 1000, // 1 minute
  },

  // Blog-related routes
  blog: {
    limit: 60,
    windowMs: 60 * 1000, // 1 minute
  },

  // Visitor data route
  visitor: {
    limit: 30,
    windowMs: 60 * 1000, // 1 minute
  },
};

// Security header configuration
export const securityHeaders = {
  // Default security headers for all API responses
  default: {
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },

  // Additional headers for endpoints that support caching
  cacheable: {
    "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
  },
};

// Allowed CORS origins
export const corsConfig = {
  origins: process.env.NODE_ENV === "production" ? ["https://witl.xyz"] : ["http://localhost:3000"],
  methods: ["GET", "POST", "OPTIONS"],
  headers: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 hours
};
