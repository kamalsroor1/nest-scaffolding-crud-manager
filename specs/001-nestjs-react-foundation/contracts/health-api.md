# API Contract: Health Endpoints

**Feature**: 001-nestjs-react-foundation
**Contract Version**: 1.0.0
**Base URL**: `http://localhost:3000/api/v1`
**Swagger**: `http://localhost:3000/api/docs`

All responses use the unified envelope format defined in the constitution (Principle IV).
Authentication: NOT required for health endpoints (public, rate-limited).

---

## GET /api/v1/health

**Purpose**: Overall system health status  
**Auth**: None  
**Rate limit**: 100 req / 60s (global default)  
**Swagger decorators**: `@ApiTags('health')`, `@ApiOperation`, `@ApiResponse`

### Success Response — HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "System is healthy",
  "data": {
    "status": "ok",
    "db": "ok",
    "redis": "ok"
  },
  "meta": null
}
```

### Degraded Response — HTTP 200 (partial failure)

> Health endpoints always return 200 to prevent load-balancer false positives.
> Check `data.status` for actual system state.

```json
{
  "success": true,
  "statusCode": 200,
  "message": "System degraded",
  "data": {
    "status": "error",
    "db": "error",
    "redis": "ok"
  },
  "meta": null
}
```

---

## GET /api/v1/health/db

**Purpose**: PostgreSQL connection status  
**Auth**: None  
**Rate limit**: 100 req / 60s  
**Implementation**: `prisma.$queryRaw\`SELECT 1\``

### Success Response — HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Database is healthy",
  "data": {
    "status": "ok",
    "db": "ok",
    "redis": "unknown"
  },
  "meta": null
}
```

### Degraded Response — HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Database degraded",
  "data": {
    "status": "error",
    "db": "error",
    "redis": "unknown"
  },
  "meta": null
}
```

---

## GET /api/v1/health/redis

**Purpose**: Redis connection status  
**Auth**: None  
**Rate limit**: 100 req / 60s  
**Implementation**: TCP ping to Redis host:port

### Success Response — HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Redis is healthy",
  "data": {
    "status": "ok",
    "db": "unknown",
    "redis": "ok"
  },
  "meta": null
}
```

### Degraded Response — HTTP 200

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Redis degraded",
  "data": {
    "status": "error",
    "db": "unknown",
    "redis": "error"
  },
  "meta": null
}
```

---

## Common Error Responses

These apply to all endpoints globally via `GlobalExceptionFilter`.

### 429 Too Many Requests

```json
{
  "success": false,
  "statusCode": 429,
  "message": "Too Many Requests",
  "errors": [],
  "timestamp": "2026-04-10T14:48:00.000Z",
  "path": "/api/v1/health"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal server error",
  "errors": [],
  "timestamp": "2026-04-10T14:48:00.000Z",
  "path": "/api/v1/health"
}
```

---

## Request Headers

| Header | Required | Value |
|--------|----------|-------|
| `X-Request-ID` | Auto-set by server | UUID v4 — echoed in response headers |

> Note: `X-Request-ID` appears on the **response** only. Clients may optionally send it
> to correlate their own logs with the server log stream.
