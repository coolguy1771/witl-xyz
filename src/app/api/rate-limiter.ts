/**
 * Best-effort per-isolate rate limiter for API routes.
 * For strict global limits, add Cloudflare Rate Limiting or KV at the edge.
 */

interface RequestRecord {
  count: number;
  firstRequest: number;
  lastRequest: number;
}

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 20;

class RateLimiter {
  private requestMap = new Map<string, RequestRecord>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs = DEFAULT_WINDOW_MS, maxRequests = DEFAULT_MAX_REQUESTS) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(key: string): boolean {
    const now = Date.now();
    this.cleanup(now);

    const record = this.requestMap.get(key) ?? {
      count: 0,
      firstRequest: now,
      lastRequest: now,
    };

    if (now - record.firstRequest > this.windowMs) {
      record.count = 0;
      record.firstRequest = now;
    }

    record.count += 1;
    record.lastRequest = now;
    this.requestMap.set(key, record);

    return record.count > this.maxRequests;
  }

  private cleanup(now: number): void {
    const expiredBefore = now - this.windowMs - 60_000;

    for (const [key, record] of this.requestMap.entries()) {
      if (record.lastRequest < expiredBefore) {
        this.requestMap.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();
