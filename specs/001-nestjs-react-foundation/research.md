# Research: NestJS + React Project Foundation

**Feature**: 001-nestjs-react-foundation
**Phase**: 0 — Research & Decision Log
**Date**: 2026-04-10

All technology choices for Sprint 1 were provided explicitly by the user. This document
records the rationale, version decisions, integration patterns, and alternatives considered
for each major component.

---

## Decision 1: Monorepo Structure — pnpm Workspaces

**Decision**: Single repository with `backend/` and `frontend/` as pnpm workspace packages.
Root `package.json` defines workspace scripts only (`dev`, `build`, `lint`, `test`).

**Rationale**:
- pnpm workspaces eliminate duplicate `node_modules` via content-addressable storage (saves ~200MB).
- `pnpm --filter backend ...` allows independent CI steps per package without leaving the monorepo.
- Shared root ESLint + Prettier config enforces constitution Principle I across both packages.
- Docker Compose volume-mounts each workspace root independently for hot-reload.

**`pnpm-workspace.yaml`**:
```yaml
packages:
  - "backend"
  - "frontend"
```

**Alternatives Considered**:
- `npm workspaces` — rejected: no content-addressable store; slower installs.
- Separate repos — rejected: overhead of coordinating two repos for a tightly coupled boilerplate.
- Turborepo — rejected: adds complexity beyond Sprint 1 scope; can be added later.

---

## Decision 2: NestJS Bootstrap & Global Middleware Order

**Decision**: Register global middleware in `main.ts` in this strict order to avoid
interceptor/filter ordering bugs that are common in NestJS:

```
1. app.setGlobalPrefix('api/v1')
2. app.use(RequestIdMiddleware)       ← assigns req.requestId before anything else
3. app.useGlobalPipes(ValidationPipe)
4. app.useGlobalFilters(GlobalExceptionFilter)   ← must be after pipes
5. app.useGlobalInterceptors(ResponseInterceptor)
6. SwaggerModule.setup('api/docs', app, document)
7. app.listen(PORT)
```

**Rationale**: NestJS processes middleware → guards → interceptors (pre) → pipes → handler →
interceptors (post) → exception filters. Registering `RequestIdMiddleware` as Express middleware
(not NestJS interceptor) ensures the ID is available before NestJS layers run, enabling it to
appear in exception filter logs.

**`RequestIdMiddleware`**: Uses `uuid` v4 or falls back to `crypto.randomUUID()` (Node 19+).
Attaches to `req.requestId` and writes `X-Request-ID` response header.

**Alternatives Considered**:
- Using a NestJS interceptor for request ID — rejected: interceptors run after guards, meaning
  guard-level auth errors would not have a request ID in logs.

---

## Decision 3: Winston + nest-winston Integration Pattern

**Decision**: Use `nest-winston` to replace NestJS's built-in logger with Winston. Configure
via `WinstonModule.forRootAsync()` in `AppModule`. Inject `WINSTON_MODULE_PROVIDER` token
into services that need structured logging.

**Log format (development)**: Colorized `printf` with `[timestamp] [level] [requestId] message`.
**Log format (production)**: JSON via `winston.format.json()` — written to `logs/error.log` and
`logs/combined.log`.

**Transport configuration**:
```typescript
transports: [
  new winston.transports.Console({
    silent: process.env.NODE_ENV === 'test',
    format: isProduction ? winston.format.json() : winstonColorize(),
  }),
  ...(isProduction ? [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ] : []),
]
```

**Alternatives Considered**:
- Pino + pino-http — rejected: user explicitly specified Winston.
- Custom NestJS Logger wrapper — rejected: nest-winston provides the official integration.

---

## Decision 4: Config Module — Joi Validation Schema

**Decision**: Use `@nestjs/config` with `ConfigModule.forRoot({ validate: joiValidate })`.
Expose a typed `ConfigService` via a wrapper to avoid string-key lookups.

**Joi Schema**:
```typescript
Joi.object({
  NODE_ENV:           Joi.string().valid('development','production','test').default('development'),
  PORT:               Joi.number().default(3000),
  DATABASE_URL:       Joi.string().uri().required(),
  JWT_ACCESS_SECRET:  Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  REDIS_URL:          Joi.string().uri().required(),
  THROTTLE_TTL:       Joi.number().default(60),
  THROTTLE_LIMIT:     Joi.number().default(100),
})
```

**Alternatives Considered**:
- `zod` for env validation — rejected: user specified Joi; Joi integrates natively with `@nestjs/config`.
- `.env` direct `process.env` access — rejected: bypasses type safety and validation.

---

## Decision 5: Global Exception Filter — Error Handling Matrix

**Decision**: A single `GlobalExceptionFilter` catches all exceptions and maps them to the
unified error envelope. Mapping table:

| Exception Type | HTTP Status | `errors[]` content |
|---------------|------------|-------------------|
| `HttpException` | Exception's statusCode | Exception's message or response object |
| Prisma `P2002` (unique constraint) | 409 | Field from Prisma meta |
| Prisma `P2025` (record not found) | 404 | "Resource not found" |
| `ValidationError` (class-validator) | 400 | Array of `{ field, constraints }` |
| Any other `Error` | 500 | "Internal server error" (never expose stack in production) |

**Stack trace**: included in `errors[]` only when `NODE_ENV === 'development'`.

**Alternatives Considered**:
- Per-module exception filters — rejected: inconsistent envelope format risk.
- NestJS built-in exception filter — rejected: does not produce the unified format.

---

## Decision 6: Health Checks — @nestjs/terminus Indicators

**Decision**: Use `@nestjs/terminus` `HealthCheckService` + custom indicators.

| Endpoint | Indicator | Healthy when | Degraded response |
|---------|-----------|-------------|-------------------|
| `GET /api/v1/health` | `HttpHealthIndicator` (self-ping) | HTTP 200 from self | Still returns 200 with degraded map |
| `GET /api/v1/health/db` | `PrismaHealthIndicator` (custom: `prisma.$queryRaw\`SELECT 1\``) | Query succeeds | Returns 200 with `db: "error"` |
| `GET /api/v1/health/redis` | `MicroserviceHealthIndicator` (TCP ping to Redis) | Connection succeeds | Returns 200 with `redis: "error"` |

**Critical design choice**: Health endpoints MUST return HTTP 200 even when indicators are
degraded — they use the unified success envelope with degraded status in `data`. This prevents
load balancer 503 cascades on transient DB hiccups. Only the overall `/health` endpoint may
return non-200 in a severe all-systems-down scenario.

---

## Decision 7: Frontend Axios Instance — Interceptor Design

**Decision**: Single Axios instance (`src/lib/axios.ts`) with two interceptors:

**Request interceptor**:
```typescript
config.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`;
```

**Response interceptor (error)**:
```typescript
if (error.response?.status === 401) {
  localStorage.removeItem('accessToken');
  window.location.href = '/login';
}
return Promise.reject(error);
```

**Sprint 1 scope**: No token refresh logic yet (refresh tokens are Sprint 2). The 401
handler simply redirects to login — this is documented in spec Assumptions.

**Alternatives Considered**:
- `react-query` + custom fetch — rejected: user specified Axios and Sprint 1 doesn't need
  server-state caching.
- Token refresh in Sprint 1 — rejected: JWT issuance is Sprint 2 scope.

---

## Decision 8: Dark Mode — Tailwind + localStorage Strategy

**Decision**: Tailwind CSS dark mode strategy: `class` (not `media`). This gives explicit
user control. A `useTheme` hook reads from `localStorage` on mount, applies/removes the
`dark` class on `<html>`, and persists changes.

```typescript
// tailwind.config.ts
darkMode: 'class'

// useTheme.ts
const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
useEffect(() => {
  document.documentElement.classList.toggle('dark', isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}, [isDark]);
```

**Alternatives Considered**:
- `media` strategy — rejected: cannot be user-overridden without additional logic.
- CSS variables only — rejected: Tailwind's class strategy already handles this cleanly.

---

## Decision 9: Docker Compose — Service Architecture

**Development** (`docker-compose.yml`):
- `postgres`: `postgres:16-alpine`, volume-persisted, exposes 5432
- `redis`: `redis:7-alpine`, exposes 6379
- `backend`: built from `backend/Dockerfile.dev`, volume-mounts `./backend:/app`, runs
  `pnpm run start:dev` (NestJS watch mode), depends on `postgres` + `redis`
- `frontend`: built from `frontend/Dockerfile.dev`, volume-mounts `./frontend:/app`,
  runs `pnpm run dev -- --host`, exposes 5173

**Production** (`docker-compose.prod.yml`):
- `postgres` + `redis`: same as dev
- `backend`: built from `backend/Dockerfile` (multi-stage: builder → runner), runs compiled output
- Frontend is built as static assets and served from the backend in production via a static
  file middleware, OR deployed to a CDN (not configured in Sprint 1 — deferred)

**Health checks in Compose**: All services have `healthcheck` directives so `depends_on`
with `condition: service_healthy` works correctly.

---

## Decision 10: Prisma User Model — Soft Delete Design

**Decision**: Use a nullable `deletedAt DateTime?` column. Soft delete is implemented by
setting this field (never `DELETE FROM users`). Future queries filter `WHERE deletedAt IS NULL`.

```prisma
model User {
  id         String    @id @default(cuid())
  email      String    @unique
  password   String
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  deletedAt  DateTime?

  @@map("users")
}
```

**CUID over UUID**: CUID is shorter, URL-safe, and monotonically increasing (better index
performance). Can be swapped to UUID at team preference.

**Alternatives Considered**:
- `isDeleted: Boolean` flag — rejected: doesn't record WHEN deletion happened; harder to
  implement TTL-based purge scripts.
- Separate `deleted_users` table — rejected: over-engineering for Sprint 1.
