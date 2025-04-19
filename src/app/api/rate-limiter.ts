/**
 * Simple in-memory rate limiter to protect API routes
 * For production use, consider using Redis or a similar distributed solution
 */

// Request tracking model
interface RequestRecord {
  count: number;
  firstRequest: number;
  lastRequest: number;
}

class RateLimiter {
  private requestMap: Map<string, RequestRecord> = new Map();
  private readonly windowMs: number = 60 * 1000; // 1 minute window
  private readonly maxRequests: number = 20; // Max requests per window
  private readonly cleanupInterval: number = 5 * 60 * 1000; // Cleanup every 5 minutes

  constructor() {
    // Set up cleanup of old records
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  /**
   * Check if a request should be rate limited
   * @param key The identifier for rate limiting (typically IP address)
   * @returns true if the request should be limited, false otherwise
   */
  async check(key: string): Promise<boolean> {
    const now = Date.now();
    const record = this.requestMap.get(key) || {
      count: 0,
      firstRequest: now,
      lastRequest: now
    };

    // Reset if window has expired
    if (now - record.firstRequest > this.windowMs) {
      record.count = 0;
      record.firstRequest = now;
    }

    // Update the record
    record.count += 1;
    record.lastRequest = now;
    this.requestMap.set(key, record);

    // API-specific limits
    if (key.includes('ssl') || key.includes('certificate')) {
      // Stricter limits for SSL certificate API
      return record.count > 5;
    }

    // Default limit
    return record.count > this.maxRequests;
  }

  /**
   * Clean up old records to prevent memory leaks
   */
  private cleanup(): void {
    const now = Date.now();
    const expired = now - this.windowMs - 60000; // Add a buffer

    for (const [key, record] of this.requestMap.entries()) {
      if (record.lastRequest < expired) {
        this.requestMap.delete(key);
      }
    }
  }
}

// Export a singleton instance
export const rateLimiter = new RateLimiter();