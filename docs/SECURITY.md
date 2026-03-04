# Security Best Practices

This document outlines the security practices implemented in the ShadowMix project.

## 1. Architecture Security

### Defense in Depth

The system implements multiple layers of protection:

1. **Client-side validation** — Immediate user feedback via Zod schemas
2. **Server-side validation** — Edge Functions validate all payloads independently
3. **Database RLS** — Restrictive Row-Level Security blocks direct public access
4. **Rate limiting** — IP-based throttling prevents abuse
5. **Security headers** — Applied to all HTTP responses

### Module Isolation

- Modules communicate only via the EventBus (no direct imports)
- Domain layer has zero infrastructure dependencies
- Sensitive operations are isolated in the backend (Edge Functions)

## 2. Input Validation

### Bitcoin Address Validation

All Bitcoin addresses are validated using regex patterns:
- Legacy (P2PKH): Starts with `1`
- P2SH: Starts with `3`
- Bech32 (SegWit): Starts with `bc1q`
- Bech32m (Taproot): Starts with `bc1p`

### Contact Form Validation

Validated both client-side (Zod) and server-side:
- Subject: 3–100 characters, sanitized
- Message: 10–2000 characters, sanitized
- Reply contact: Optional, max 500 characters

### Input Sanitization

All text inputs are sanitized:
- Null bytes removed
- Control characters stripped (except newlines/tabs)
- Excessive whitespace collapsed

## 3. Secure Random Generation

All identifiers use `crypto.getRandomValues()`:
```typescript
const array = new Uint8Array(16);
crypto.getRandomValues(array);
```

## 4. HTTP Security Headers

Applied globally to all Edge Function responses:

| Header | Value |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `no-referrer` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Content-Security-Policy` | Restrictive; `frame-ancestors 'none'` |

## 5. Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `contact` | 5 requests | 10 minutes |
| `mix-sessions` | 10 requests | 10 minutes |

Rate limiting is based on SHA-256 hashed IP addresses (no raw IPs stored).

## 6. Data Minimization & Privacy

### Structured Logging

All logs pass through a privacy-preserving logger that redacts:
- Bitcoin addresses (legacy, P2SH, Bech32, testnet)
- IP addresses
- Email addresses

### Log Format

Structured JSON with:
- `requestId` — Correlation ID
- `endpoint` — Request target
- `status` — HTTP status
- `latencyMs` — Response time
- `rateLimitTriggered` — Boolean flag

**No sensitive data is logged.**

## 7. Error Responses

Standardized format prevents information leakage:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "User-safe message"
  }
}
```

Internal errors never expose stack traces or implementation details.

## 8. Database Security

- All tables have RLS enabled
- Public access blocked via `USING (false) WITH CHECK (false)` policies
- All data operations go through Edge Functions using the service role
- No raw SQL execution from client

## 9. Secret Management

- API keys and credentials stored in Cloud secrets
- Accessed via `Deno.env.get()` in Edge Functions
- Never exposed to the frontend
- Publishable keys only in client code

## 10. XSS Prevention

- React automatically escapes rendered content
- No `dangerouslySetInnerHTML` with user content
- CSP restricts script sources to `'self'`

## 11. Maintenance

- Automated cleanup job expires stale sessions and prunes rate limit records
- Scheduled via pg_cron for continuous database hygiene

## 12. Reporting Security Issues

If you discover a vulnerability:
1. Use the anonymous contact form
2. Use encrypted communication via PGP key (when available)

Do not publicly disclose vulnerabilities until addressed.
