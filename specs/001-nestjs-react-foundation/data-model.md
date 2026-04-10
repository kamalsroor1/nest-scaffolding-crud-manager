# Data Model: NestJS + React Project Foundation

**Feature**: 001-nestjs-react-foundation
**Phase**: 1 — Design
**Date**: 2026-04-10

## Entities

### User

The only database entity in Sprint 1. Serves as the identity anchor for Sprint 2 (Auth).

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | `String` | PK, `@default(cuid())` | CUID for URL-safe, ordered IDs |
| `email` | `String` | `@unique`, NOT NULL | Lowercased before save (application-level) |
| `password` | `String` | NOT NULL | bcrypt hash — never stored plain |
| `createdAt` | `DateTime` | `@default(now())`, NOT NULL | Auto-set on insert |
| `updatedAt` | `DateTime` | `@updatedAt`, NOT NULL | Auto-updated by Prisma |
| `deletedAt` | `DateTime?` | NULL = active | Soft-delete timestamp (Principle V) |

**Prisma Schema**:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

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

**Validation rules** (enforced at DTO + DB layers):
- `email`: valid email format (RFC 5322), max 255 chars, transformed to lowercase
- `password`: min 8 chars, at least 1 uppercase, 1 number (enforced in Sprint 2 CreateUserDto)
- `deletedAt`: never set directly via API — only via `UserRepository.softDelete(id)`

**State transitions**:
```
Active (deletedAt = NULL)
    ↓ softDelete()
Soft-Deleted (deletedAt = DateTime)
    ↓ (admin script only)
Hard-Deleted (record removed) — NOT via API
```

---

## Runtime Configuration (non-entity)

Not stored in the database, but typed as a first-class data structure consumed throughout
the application.

### AppConfig Interface

```typescript
interface AppConfig {
  nodeEnv:         'development' | 'production' | 'test';
  port:             number;             // default: 3000
  databaseUrl:      string;             // PostgreSQL connection string
  jwtAccessSecret:  string;             // min 32 chars
  jwtRefreshSecret: string;             // min 32 chars
  redisUrl:         string;             // Redis connection string
  throttleTtl:      number;             // seconds window, default: 60
  throttleLimit:    number;             // max requests per window, default: 100
}
```

---

## Response DTOs (API contract shapes)

### SuccessResponseDto\<T\>

Used by `ResponseInterceptor` to wrap all successful responses:

```typescript
class SuccessResponseDto<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta;  // optional, used by paginated endpoints in later sprints
}
```

### ErrorResponseDto

Used by `GlobalExceptionFilter` to wrap all error responses:

```typescript
class ErrorResponseDto {
  success: false;
  statusCode: number;
  message: string;
  errors: ErrorDetail[];
  timestamp: string;  // ISO 8601
  path: string;       // request path, e.g. "/api/v1/health/db"
}

class ErrorDetail {
  field?: string;       // for validation errors
  message: string;
  stack?: string;       // development only
}
```

### HealthStatusDto

Returned by all three health endpoints:

```typescript
class HealthStatusDto {
  status: 'ok' | 'error';
  db:     'ok' | 'error';
  redis:  'ok' | 'error';
}
```

---

## Database Indexes

Sprint 1 only has one model; indexes beyond the PK and unique email are not required yet.
Future sprints will add indexes as query patterns emerge.

| Table | Column | Type | Reason |
|-------|--------|------|--------|
| users | id | PK (B-tree) | Default primary key |
| users | email | Unique (B-tree) | Login lookup + uniqueness enforcement |
| users | deletedAt | (none, Sprint 1) | Partial index `WHERE deletedAt IS NULL` deferred to Sprint 2 |

---

## Migration Strategy

- Prisma Migrate (dev): `prisma migrate dev --name init` — creates `20XXXX_init.sql`
- Prisma Migrate (CI/prod): `prisma migrate deploy` — applies pending migrations without prompts
- Seed data: `prisma/seed.ts` — not required in Sprint 1 (no auth = no seed user needed)
