import { getCfEnv, getCfProperties } from "./cloudflare";

type AnalyticsEvent = "page_api" | "rate_limited" | "visitor_lookup";

/**
 * Writes a data point to Workers Analytics Engine (no-op outside Workers).
 * Query it via the SQL API / Grafana. Never pass IPs or other PII.
 *   blobs:   [event, path, country, colo]
 *   doubles: [1]  (so SUM(_sample_interval * double1) counts events)
 */
export function trackEvent(event: AnalyticsEvent, path: string): void {
  try {
    const dataset = getCfEnv()?.ANALYTICS;
    if (!dataset) return;

    const cf = getCfProperties();
    dataset.writeDataPoint({
      indexes: [event],
      blobs: [event, path, cf?.country ?? "", cf?.colo ?? ""],
      doubles: [1],
    });
  } catch {
    // Analytics must never break a request.
  }
}
