# API Key Security Documentation

## Overview

This document outlines the security architecture for API key management in this application. The system has been refactored to eliminate client-side storage of sensitive API keys and implement secure server-side storage using Cloudflare KV.

## Security Architecture

### ❌ Previous Implementation (INSECURE)
- API keys were stored in browser localStorage
- Keys were accessible to any JavaScript code on the same origin
- Keys persisted indefinitely in the browser
- No encryption or secure storage mechanisms

### ✅ Current Implementation (SECURE)
- API keys are stored exclusively in Cloudflare KV on the backend
- Keys are never transmitted to or stored on the client
- All key operations require admin authentication
- Keys are hashed using SHA-256 for validation
- Rate limiting and expiration are enforced server-side

## API Endpoints

All API key operations are performed through secure backend endpoints:

| Endpoint | Method | Description | Required Auth |
|----------|--------|-------------|---------------|
| `/api/admin/api-keys` | GET | List all API keys (sanitized) | Admin token |
| `/api/admin/api-keys` | POST | Create a new API key | Admin token |
| `/api/admin/api-keys?keyId={id}` | PUT | Update an API key | Admin token |
| `/api/admin/api-keys?keyId={id}` | DELETE | Delete an API key | Admin token |
| `/api/admin/api-keys?action=usage&keyId={id}` | GET | Get usage statistics | Admin token |
| `/api/admin/api-keys?action=statistics` | GET | Get overall statistics | Admin token |

## Security Best Practices

### 1. Never Store Keys Client-Side
- ❌ Don't use localStorage, sessionStorage, or cookies for API keys
- ❌ Don't include keys in client-side JavaScript
- ✅ Only store keys in secure backend storage (Cloudflare KV)

### 2. Authentication & Authorization
- All admin endpoints require `X-Admin-Token` header
- API keys are validated server-side using SHA-256 hashing
- Permissions are enforced at the endpoint level

### 3. Key Transmission
- API keys are only shown once when created
- Keys are partially masked in all subsequent API responses
- Use HTTPS for all API communications

### 4. Rate Limiting & Expiration
- Rate limits are enforced server-side
- Keys can have expiration dates
- Usage is tracked in Cloudflare KV

## Migration Guide

If you have existing keys in localStorage:

1. **Export existing keys** (if needed for reference)
2. **Create new keys** using the secure API:
   ```javascript
   const client = new SecureApiKeyClient(adminToken);
   const newKey = await client.createApiKey(name, permissions, rateLimit);
   ```
3. **Update your application** to use the new key
4. **Clear localStorage** to remove old keys:
   ```javascript
   localStorage.removeItem('api_keys_v1');
   localStorage.removeItem('api_usage_v1');
   ```

## Client Usage Example

```typescript
import { SecureApiKeyClient } from '@/app/lib/api-key-client';

// Initialize client with admin token
const apiKeyClient = new SecureApiKeyClient(process.env.ADMIN_TOKEN);

// Create a new API key
const apiKey = await apiKeyClient.createApiKey(
  'My API Key',
  ['read', 'write'],
  1000, // rate limit
  '2024-12-31T23:59:59Z' // expiration
);

// List all keys (sanitized)
const keys = await apiKeyClient.getApiKeys();

// Get usage statistics
const usage = await apiKeyClient.getApiUsage(keyId, 7);

// Update a key
await apiKeyClient.updateApiKey(keyId, {
  isActive: false
});

// Delete a key
await apiKeyClient.deleteApiKey(keyId);
```

## Environment Variables

Required environment variables:

- `ADMIN_TOKEN`: Secret token for admin authentication
- `API_KEYS_NAMESPACE_ID`: Cloudflare KV namespace ID for API keys
- `API_USAGE_NAMESPACE_ID`: Cloudflare KV namespace ID for usage tracking

## Security Checklist

- [ ] Remove all localStorage references for API keys
- [ ] Implement admin authentication for all key management endpoints
- [ ] Use HTTPS for all API communications
- [ ] Hash API keys before storage
- [ ] Implement rate limiting
- [ ] Set appropriate CORS headers
- [ ] Log all key operations for audit trail
- [ ] Regularly rotate admin tokens
- [ ] Monitor for suspicious usage patterns
- [ ] Implement key expiration policies

## Incident Response

If an API key is compromised:

1. Immediately deactivate the key via the admin API
2. Review usage logs for suspicious activity
3. Create a new key with updated permissions
4. Update all systems using the compromised key
5. Document the incident for future reference

## Compliance

This implementation helps meet security requirements for:
- OWASP API Security Top 10
- PCI DSS (for payment-related APIs)
- SOC 2 Type II
- GDPR (data protection)

## Support

For security concerns or questions, please contact the security team or create an issue in the repository with the `security` label.