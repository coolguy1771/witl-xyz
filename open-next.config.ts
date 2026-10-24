import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";

export default defineCloudflareConfig({
  // R2 is strongly consistent (KV is not), fronted by the per-colo Cache API.
  incrementalCache: withRegionalCache(r2IncrementalCache, {
    mode: "long-lived",
  }),
  // Without a real queue, `revalidate = N` routes are never refreshed in the
  // background. Memory queue re-requests the route through WORKER_SELF_REFERENCE.
  queue: memoryQueue,
});
