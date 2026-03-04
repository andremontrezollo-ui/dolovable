# ShadowMix — API Contract

## Base URL

All endpoints are served via Edge Functions:
```
{SUPABASE_URL}/functions/v1/{function-name}
```

## Authentication

All endpoints use the public `apikey` header for identification (no JWT required).

---

## Endpoints

### POST `/functions/v1/mix-sessions`

Create a new mixing session.

**Request:** No body required.

**Response (201):**
```json
{
  "sessionId": "uuid",
  "depositAddress": "tb1q...",
  "createdAt": "2026-03-04T00:00:00Z",
  "expiresAt": "2026-03-04T00:30:00Z",
  "status": "active"
}
```

**Rate Limit:** 10 requests / 10 minutes per IP.

---

### POST `/functions/v1/mix-session-status`

Query session status.

**Request:**
```json
{
  "sessionId": "uuid"
}
```

**Response (200):**
```json
{
  "sessionId": "uuid",
  "status": "active | expired",
  "expiresAt": "2026-03-04T00:30:00Z",
  "createdAt": "2026-03-04T00:00:00Z"
}
```

**Response (404):**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Session not found"
  }
}
```

---

### POST `/functions/v1/contact`

Create a support ticket.

**Request:**
```json
{
  "subject": "string (3-100 chars)",
  "message": "string (10-2000 chars)",
  "replyContact": "string (optional, max 500 chars)"
}
```

**Response (201):**
```json
{
  "ticketId": "TKT-XXXXXX",
  "createdAt": "2026-03-04T00:00:00Z"
}
```

**Rate Limit:** 5 requests / 10 minutes per IP.

---

### GET/POST `/functions/v1/health`

Health check.

**Response (200):**
```json
{
  "status": "ok",
  "uptime": 3600,
  "version": "1.0.0",
  "timestamp": "2026-03-04T00:00:00Z"
}
```

---

### POST `/functions/v1/cleanup`

Maintenance job: expire sessions, prune rate limits.

**Response (200):**
```json
{
  "status": "ok",
  "expiredSessions": 5,
  "deletedRateLimits": 42,
  "timestamp": "2026-03-04T00:00:00Z"
}
```

---

## Error Format

All errors follow a standardized format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input |
| `NOT_FOUND` | 404 | Resource not found |
| `METHOD_NOT_ALLOWED` | 405 | Wrong HTTP method |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### Rate Limit Response

When rate limited, the response includes:
- HTTP 429 status
- `Retry-After` header (seconds)
- `retryAfterSeconds` in error details

---

## Security Headers

All responses include:

| Header | Value |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `no-referrer` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Content-Security-Policy` | Restrictive policy with frame-ancestors 'none' |
