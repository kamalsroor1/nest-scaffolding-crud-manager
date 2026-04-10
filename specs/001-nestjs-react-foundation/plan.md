# Implementation Plan: NestJS + React Project Foundation

**Branch**: `001-nestjs-react-foundation` | **Date**: 2026-04-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-nestjs-react-foundation/spec.md`

## Summary

Build a production-ready monorepo boilerplate (pnpm workspaces: `/backend` + `/frontend`) that
developers can clone to start any NestJS + React project. The backend delivers a fully-wired
NestJS 10 application with global exception handling, response interception, Winston structured
logging, Prisma 5 + PostgreSQL 16, health-check endpoints, Swagger, and ThrottlerModule rate
limiting. The frontend delivers a React 18 + Vite 5 shell with Tailwind CSS, shadcn/ui,
React Router v6, a pre-configured Axios instance, protected routes, dark mode, and a
sidebar/header layout. Docker Compose orchestrates all services locally; a separate prod
compose file is also provided.

## Technical Context

**Language/Version**: TypeScript 5 (strict) — backend (Node.js 20 LTS) + frontend (browser)
**Primary Dependencies**:
- Backend: NestJS 10, Prisma 5, class-validator, class-transformer, @nestjs/config + Joi,
  nest-winston + Winston, @nestjs/terminus, @nestjs/swagger, @nestjs/throttler
- Frontend: React 18, Vite 5, Tailwind CSS 3, shadcn/ui, React Router v6, Axios
- Package manager: pnpm 9 (workspaces)

**Storage**: PostgreSQL 16 (primary DB via Prisma) + Redis 7 (cache/queue-ready)
**Testing**: Jest 29 (backend unit + integration), Supertest (e2e), no frontend tests in Sprint 1
**Target Platform**: Linux Docker containers (dev + prod); macOS/Windows via Docker Desktop
**Project Type**: Monorepo web application (NestJS REST API + React SPA)
**Performance Goals**: Health endpoint < 500ms p99; API startup < 15s; clone-to-running < 5 min
**Constraints**: pnpm workspaces must support independent `pnpm --filter backend ...` commands;
  Docker hot-reload must work without full image rebuild; strict TypeScript — zero `any` types
**Scale/Scope**: Sprint 1 foundation only — 3 API endpoints, 1 DB model, 3 frontend routes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify the following gates against `.specify/memory/constitution.md` (v1.1.0):

| # | Principle | Gate Question | Status |
|---|-----------|--------------|--------|
| I | Code Quality | Does this feature introduce any `any` types, ESLint suppressions, or undocumented public methods? | ✅ All classes/methods have JSDoc; ESLint + Prettier configured in root; strict TS enforced |
| II | Modular Architecture | Is the feature fully encapsulated in a NestJS module? Does it use the Repository pattern for DB access? Are DTOs defined for all I/O? | ✅ ConfigModule, HealthModule encapsulated; PrismaService in DatabaseModule; health DTOs defined |
| III | Testing Discipline | Are unit tests planned for every Service method? Are integration tests planned for every Controller endpoint? Will coverage remain ≥ 70%? | ✅ Unit tests: ConfigService, PrismaService, HealthService; Integration: HealthController (3 endpoints) |
| IV | API Contract | Are all endpoints prefixed `/api/v1/`? Are success/error envelopes used? Is Swagger documentation included in the plan? | ✅ Global prefix + Swagger at `/api/docs`; ResponseInterceptor + ExceptionFilter enforce envelopes |
| V | Security | Does the feature require RBAC guards? Are all public endpoints rate-limited? Does any delete operation use soft delete? | ⚠ RBAC Guard registered globally (no permissions enforced yet — documented in spec Assumptions); rate limiting globally configured; no deletes in Sprint 1 |
| VI | Frontend Standards | Do generated/new pages use the shared `DataTable` and `Form` components? Are protected routes guarded by permission check? Are toasts used for all feedback? | ✅ ProtectedRoute wraps /dashboard; Toaster registered globally; DataTable/Form not needed in Sprint 1 (no data pages) |
| VII | Generator Parity | If a Generator template is modified, does the rendered output match handwritten module patterns? Are all Swagger decorators included? | ✅ Generator not modified in Sprint 1; handwritten modules establish the patterns the generator will follow |
| VIII | Agent Workflow & Tracking | Does `history.md` exist at the repo root? Will every action be appended in timestamped format? | ✅ history.md exists and is being updated with each plan artifact |

> ⚠ Gate V partial: RBAC Guard class is created and registered but `resource:action` enforcement is
> explicitly deferred to Sprint 2 (Auth module). Documented in spec Assumptions — justified.

## Project Structure

### Documentation (this feature)

```text
specs/001-nestjs-react-foundation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── health-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
nest-scaffolding-crud-manager/       ← repo root
├── package.json                     ← pnpm workspace root (scripts only)
├── pnpm-workspace.yaml              ← workspace definition
├── docker-compose.yml               ← dev: postgres, redis, backend, frontend
├── docker-compose.prod.yml          ← prod: postgres, redis, backend
├── .env.example                     ← documented env vars
├── .env                             ← local (gitignored)
├── history.md                       ← audit log (Principle VIII)
│
├── backend/                         ← NestJS application
│   ├── package.json
│   ├── tsconfig.json                ← strict: true
│   ├── .eslintrc.js
│   ├── .prettierrc
│   ├── nest-cli.json
│   ├── prisma/
│   │   ├── schema.prisma            ← User model + soft-delete
│   │   └── migrations/
│   ├── src/
│   │   ├── main.ts                  ← bootstrap, global pipes/filters/interceptors
│   │   ├── app.module.ts            ← root module
│   │   ├── common/
│   │   │   ├── decorators/          ← (placeholder for Sprint 2 auth decorators)
│   │   │   ├── filters/
│   │   │   │   └── global-exception.filter.ts
│   │   │   ├── interceptors/
│   │   │   │   └── response.interceptor.ts
│   │   │   ├── guards/
│   │   │   │   └── rbac.guard.ts    ← registered globally; no enforcement yet
│   │   │   └── middleware/
│   │   │       └── request-id.middleware.ts
│   │   ├── config/
│   │   │   ├── app.config.ts        ← Joi validation schema
│   │   │   └── config.module.ts
│   │   ├── database/
│   │   │   ├── prisma.service.ts
│   │   │   └── database.module.ts
│   │   └── modules/
│   │       └── health/
│   │           ├── health.controller.ts
│   │           ├── health.service.ts
│   │           └── health.module.ts
│   └── test/
│       ├── health.e2e-spec.ts
│       └── jest-e2e.json
│
└── frontend/                        ← React SPA
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx                  ← router setup
        ├── lib/
        │   ├── axios.ts             ← configured Axios instance with interceptors
        │   └── utils.ts             ← shadcn/ui cn() utility
        ├── hooks/
        │   ├── useTheme.ts          ← dark mode + localStorage persistence
        │   └── useToast.ts
        ├── components/
        │   ├── ui/                  ← shadcn/ui base components
        │   │   ├── button.tsx
        │   │   ├── card.tsx
        │   │   ├── input.tsx
        │   │   ├── toast.tsx
        │   │   ├── dialog.tsx
        │   │   └── table.tsx
        │   ├── layout/
        │   │   ├── AppLayout.tsx    ← sidebar + header + main content
        │   │   ├── Sidebar.tsx      ← collapsible
        │   │   └── Header.tsx       ← user menu + dark mode toggle
        │   ├── ProtectedRoute.tsx   ← checks auth token → redirect to /login
        │   └── LoadingSpinner.tsx
        └── pages/
            ├── LoginPage.tsx
            └── DashboardPage.tsx    ← placeholder (renders AppLayout)
```

**Structure Decision**: Option 2 — Monorepo web application with `backend/` and `frontend/` as
pnpm workspace packages. Both packages share the root ESLint and Prettier config. Docker Compose
mounts each workspace package as a volume for hot-reload.

## Complexity Tracking

> Gate V partial violation — RBAC Guard skeleton registered globally without permission enforcement.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| RBAC Guard registered but not enforcing | Sprint 1 has no authenticated resources to guard; enforcing requires JWT strategy which is Sprint 2 scope | Omitting the guard entirely would require a structural refactor in Sprint 2 when Auth lands; registering now preserves the module shape |
