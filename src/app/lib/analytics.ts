import { getCfEnv, getCfProperties } from "./cloudflare";

type AnalyticsEvent = "page_api" | "rate_limited" | "visitor_lookup";

// Collapse dynamic segments so the stored label has bounded cardinality and
// can never carry user-supplied path text.
function routeLabel(path: string): string {
  if (/^\/api\/(visitor|ip|github\/projects|blog\/(posts|tags|rss))$/.test(path)) return path;
  if (path.startsWith("/api/blog/posts/")) return "/api/blog/posts/:slug";
  if (path.startsWith("/api/github/")) return "/api/github/:slug";
  return path.startsWith("/api/") ? "/api/other" : "other";
}

/**
 * Writes a data point to Workers Analytics Engine (no-op outside Workers).
 * Query it via the SQL API / Grafana. Never pass IPs or other PII.
 *   blobs:   [event, route label, country, colo]
 *   doubles: [1]  (so SUM(_sample_interval * double1) counts events)
 */
export function trackEvent(event: AnalyticsEvent, path: string): void {
  try {
    const dataset = getCfEnv()?.ANALYTICS;
    if (!dataset) return;

    const cf = getCfProperties();
    dataset.writeDataPoint({
      indexes: [event],
      blobs: [event, routeLabel(path), cf?.country ?? "", cf?.colo ?? ""],
      doubles: [1],
    });
  } catch {
    // Analytics must never break a request.
  }
}
