# API Key Security Documentation

## Status

The `/api/admin/api-keys` routes described below are **not implemented yet**. This document captures the intended server-side API key architecture.

## Current Implementation

- API keys are not stored in browser `localStorage` or `sessionStorage`.
- Admin operations should use Worker secrets rather than client-side key storage.
- See `CLAUDE.md` for Cloudflare integration details.

## Planned Architecture

API keys will be stored exclusively in Cloudflare KV on the backend. Keys will not be transmitted to or stored on the client. All key operations will require admin authentication. Keys will be hashed using SHA-256 for validation, with rate limiting and expiration enforced server-side.

## Planned API Endpoints

| Endpoint | Method | Description | Required Auth |
|----------|--------|-------------|---------------|
| `/api/admin/api-keys` | GET | List all API keys (sanitized) | Admin token |
| `/api/admin/api-keys` | POST | Create a new API key | Admin token |
| `/api/admin/api-keys?keyId={id}` | PUT | Update an API key | Admin token |
| `/api/admin/api-keys?keyId={id}` | DELETE | Delete an API key | Admin token |
| `/api/admin/api-keys?action=usage&keyId={id}` | GET | Get usage statistics | Admin token |
| `/api/admin/api-keys?action=statistics` | GET | Get overall statistics | Admin token |

## Environment Variables

Required environment variables for the planned implementation:

- `ADMIN_TOKEN`: Secret token for admin authentication
- `API_KEYS_NAMESPACE_ID`: Cloudflare KV namespace ID for API keys
- `API_USAGE_NAMESPACE_ID`: Cloudflare KV namespace ID for usage tracking

### Creating KV Namespaces

```bash
# Create KV namespaces using Wrangler CLI
wrangler kv namespace create "API_KEYS"
wrangler kv namespace create "API_USAGE"

# Add the returned namespace IDs to wrangler.jsonc kv_namespaces
# and export them as API_KEYS_NAMESPACE_ID / API_USAGE_NAMESPACE_ID
```

See `CLAUDE.md` for broader Cloudflare integration guidance.

## Security Checklist (for implementation)

- [ ] Remove all localStorage references for API keys
- [ ] Implement admin authentication for all key management endpoints
- [ ] Use HTTPS for all API communications
- [ ] Hash API keys before storage
- [ ] Implement rate limiting
- [ ] Set appropriate CORS headers
- [ ] Log key management operations (without logging raw keys)

## Migration Notes

If legacy keys exist in `localStorage` (`api_keys_v1`, `api_usage_v1`), clear them after migrating to server-managed keys:

```javascript
localStorage.removeItem("api_keys_v1");
localStorage.removeItem("api_usage_v1");
```

The `SecureApiKeyClient` helper referenced in earlier drafts is not implemented yet.
