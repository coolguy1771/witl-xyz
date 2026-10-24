import { waitUntil } from "./cloudflare";

/**
 * Read-through cache on the colo-local Cache API. Wraps an expensive upstream
 * call (GitHub, Open-Meteo) so repeat requests in the same location skip it.
 * No-ops to a plain call outside the Workers runtime.
 */
export async function cachedJson<T>(
  key: string,
  ttlSeconds: number,
  load: () => Promise<T>,
  shouldCache: (value: T) => boolean = () => true
): Promise<T> {
  const cache =
    typeof caches === "undefined" ? null : (caches as CacheStorage & { default?: Cache }).default;
  if (!cache) return load();

  // Cache API keys must be URLs; the host is arbitrary and never fetched.
  const cacheKey = new Request(`https://edge-cache.witl.xyz/${encodeURIComponent(key)}`);

  const hit = await cache.match(cacheKey);
  if (hit) return (await hit.json()) as T;

  const value = await load();
  if (!shouldCache(value)) return value;

  waitUntil(
    cache.put(
      cacheKey,
      new Response(JSON.stringify(value), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `public, max-age=${ttlSeconds}`,
        },
      })
    )
  );
  return value;
}
