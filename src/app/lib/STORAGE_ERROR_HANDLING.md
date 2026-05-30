# Storage Error Handling Documentation

## Status

The `CertificateMonitoringService` and its advanced localStorage recovery flow described in earlier drafts are **not implemented** in the current codebase.

## Current Behavior

The only production client-side persistence today is theme selection in `ThemeRegistry.tsx`, which reads and writes `localStorage.theme-mode` with basic try/catch error logging.

SSL tooling does not persist monitoring rules or alerts to `localStorage` keys such as `ssl_monitoring_rules` or `ssl_monitoring_alerts`.

## Planned Error Handling (not yet implemented)

When SSL monitoring persistence is added, the service should:

1. Detect quota exceeded errors across browsers (`QuotaExceededError`, `NS_ERROR_DOM_QUOTA_REACHED`, DOMException code 22).
2. Run progressive cleanup (resolved alerts, old alerts, disabled rules) before retrying writes.
3. Emit a structured `ssl-monitoring-storage-error` browser event for UI handling.
4. Expose a manual `cleanupStorage()` API for user-initiated recovery.

Until that implementation lands, treat this file as a design reference rather than documentation of live behavior.

## Related Code

- `src/app/components/ThemeRegistry.tsx` — existing localStorage usage with error handling
- `src/app/lib/ssl/certificate-fetcher.ts` — SSL fetch utilities
- `src/app/api/ssl/` — server-side SSL processing routes
