# Storage Security Documentation

## Status

This document describes the storage patterns currently used in the application. It does not describe a separate encrypted certificate storage layer.

## Current Client-Side Storage

### Theme preference

`src/app/components/ThemeRegistry.tsx` stores the user's light/dark preference in `localStorage` under the key `theme-mode`. This is non-sensitive UI state.

### SSL certificate tooling

SSL certificate analysis in `src/app/components/ssl/` is handled through API routes such as:

- `src/app/api/ssl/fetch/route.ts`
- `src/app/api/ssl/upload/route.ts`

Certificate data is processed for the active session and is not written to encrypted browser storage by the current implementation.

## Security Practices

- Do not store API keys, admin tokens, or certificate private keys in `localStorage` or `sessionStorage`.
- Keep sensitive credentials in Cloudflare Worker secrets / environment variables.
- Use HTTPS for all API traffic (enforced in production).

## Planned Enhancements

If client-side persistence is added for SSL monitoring history, prefer:

- Minimal data retention
- Explicit user consent
- Server-side storage for sensitive certificate metadata where possible

The previously documented modules `crypto-storage.ts` and `data-storage-secure.ts` are not part of the current codebase.
