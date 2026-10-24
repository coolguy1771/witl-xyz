import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Cloudflare bindings, or null outside the Workers runtime (build, tests). */
export function getCfEnv(): CloudflareEnv | null {
  try {
    return getCloudflareContext().env;
  } catch {
    return null;
  }
}

/** Per-request `request.cf` metadata (country, city, colo, ...), if available. */
export function getCfProperties(): IncomingRequestCfProperties | null {
  try {
    return getCloudflareContext().cf ?? null;
  } catch {
    return null;
  }
}

/** Run work after the response is sent; falls back to fire-and-forget. */
export function waitUntil(promise: Promise<unknown>): void {
  try {
    getCloudflareContext().ctx.waitUntil(promise);
  } catch {
    void promise.catch(() => undefined);
  }
}
