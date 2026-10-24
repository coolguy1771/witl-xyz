import { getCfEnv } from "@/app/lib/cloudflare";

/**
 * Rate limiter for API routes. Uses the Workers Rate Limiting binding when
 * available (counters shared per Cloudflare location, across isolates) and
 * falls back to a best-effort per-isolate map for local dev and tests.
 * Limit and period are configured on the binding in wrangler.json.
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

const fallbackLimiter = new RateLimiter();

/** Resolves true when the caller is over the limit. Fails open on binding errors. */
export async function isRateLimited(key: string): Promise<boolean> {
  const binding = getCfEnv()?.API_RATE_LIMITER;
  if (!binding) {
    return fallbackLimiter.check(key);
  }

  try {
    const { success } = await binding.limit({ key });
    return !success;
  } catch {
    return false;
  }
}
