/**
 * KV-backed rate limiter with in-memory fallback for local dev.
 * Uses NEXT_INC_CACHE_KV with a dedicated key prefix.
 */

interface RequestRecord {
  count: number;
  firstRequest: number;
  lastRequest: number;
}

const KEY_PREFIX = "__ratelimit:";
const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 20;

function readLimitConfig(): { windowMs: number; maxRequests: number } {
  const windowSec = Number(process.env.RATE_LIMIT_WINDOW ?? "60");
  const maxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? "20");

  return {
    windowMs: Number.isFinite(windowSec) && windowSec > 0 ? windowSec * 1000 : DEFAULT_WINDOW_MS,
    maxRequests:
      Number.isFinite(maxRequests) && maxRequests > 0 ? maxRequests : DEFAULT_MAX_REQUESTS,
  };
}

class InMemoryRateLimiter {
  private requestMap = new Map<string, RequestRecord>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
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

const { windowMs, maxRequests } = readLimitConfig();
const fallbackLimiter = new InMemoryRateLimiter(windowMs, maxRequests);

interface RateLimitRecord {
  count: number;
  windowStart: number;
}

async function checkKvRateLimit(key: string): Promise<boolean | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const kv = env.NEXT_INC_CACHE_KV;

    if (!kv) {
      return null;
    }

    const now = Date.now();
    const kvKey = `${KEY_PREFIX}${key}`;
    const existing = await kv.get(kvKey, "json");
    const record = (existing as RateLimitRecord | null) ?? {
      count: 0,
      windowStart: now,
    };

    if (now - record.windowStart > windowMs) {
      record.count = 0;
      record.windowStart = now;
    }

    record.count += 1;

    const ttlSeconds = Math.ceil(windowMs / 1000) + 10;
    await kv.put(kvKey, JSON.stringify(record), { expirationTtl: ttlSeconds });

    return record.count > maxRequests;
  } catch {
    return null;
  }
}

/** Returns true when the client should be rate limited. */
export async function isRateLimited(key: string): Promise<boolean> {
  const kvResult = await checkKvRateLimit(key);
  if (kvResult !== null) {
    return kvResult;
  }

  return fallbackLimiter.check(key);
}

/** @deprecated Use isRateLimited for KV-backed limits. */
export const rateLimiter = {
  check: (key: string) => fallbackLimiter.check(key),
};
