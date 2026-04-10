---
description: "Task list for feature: NestJS + React Project Foundation"
---

# Tasks: NestJS + React Project Foundation

**Input**: Design documents from `specs/001-nestjs-react-foundation/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/health-api.md ✅ | quickstart.md ✅
**Branch**: `001-nestjs-react-foundation`
**Tests**: Unit + E2E tests are included (required by constitution Principle III — ≥70% coverage gate).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in every description

## Path Conventions

- Backend source: `backend/src/`
- Backend tests: `backend/src/**/*.spec.ts` (unit) | `backend/test/` (e2e)
- Frontend source: `frontend/src/`
- Root config files: repo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize monorepo structure, tooling, and Docker orchestration
**Constitution refs**: Principles I (code quality), II (modular architecture), VIII (audit log)

- [ ] T001 Initialize pnpm workspace — create `pnpm-workspace.yaml` and root `package.json` with workspace scripts (`dev`, `build`, `lint`, `test`, `format`) at repo root
- [ ] T002 [P] Create root ESLint config `.eslintrc.js` and Prettier config `.prettierrc` at repo root (shared by backend and frontend)
- [ ] T003 [P] Create `.gitignore` at repo root (ignore: `node_modules/`, `dist/`, `.env`, `logs/`, `prisma/migrations/*.sql` history lock)
- [ ] T004 [P] Create `.env.example` at repo root with all 8 variables documented with inline comments (`DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `REDIS_URL`, `PORT`, `NODE_ENV`, `THROTTLE_TTL`, `THROTTLE_LIMIT`)
- [ ] T005 [P] Verify `history.md` exists at repo root; append `## 2026-04-10T16:56:30+02:00 - Feature 001 Implementation Kickoff` entry with bullet list of phases starting

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend and frontend scaffolding that ALL user stories depend on
**Constitution refs**: Principles I–V (quality, architecture, testing, API, security)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### 2A — Backend Scaffold

- [ ] T006 Initialize NestJS 10 project in `backend/` using NestJS CLI: `nest new backend --package-manager pnpm --skip-git`; clean generated boilerplate to match plan.md structure
- [ ] T007 Configure `backend/tsconfig.json` with `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`, `paths` for `@common/*`, `@config/*`, `@database/*`, `@modules/*`
- [ ] T008 [P] Install backend dependencies: `pnpm --filter backend add @nestjs/config joi nest-winston winston @nestjs/terminus @nestjs/swagger swagger-ui-express @nestjs/throttler @prisma/client class-validator class-transformer uuid`
- [ ] T009 [P] Install backend dev dependencies: `pnpm --filter backend add -D prisma @types/uuid jest @types/jest ts-jest supertest @types/supertest`
- [ ] T010 Create `backend/src/config/app.config.ts` — Joi validation schema for all 8 env variables (NODE_ENV defaults to `'development'`, PORT defaults to 3000, THROTTLE_TTL to 60, THROTTLE_LIMIT to 100); export typed `registerAs('app', ...)` config factory
- [ ] T011 Create `backend/src/config/config.module.ts` — `ConfigModule.forRoot({ isGlobal: true, validate: joiValidate })` wrapping the schema from T010
- [ ] T012 [P] Create `backend/src/common/middleware/request-id.middleware.ts` — NestJS middleware that generates `crypto.randomUUID()`, attaches to `req['requestId']`, and sets `X-Request-ID` response header; JSDoc on class and `use()` method
- [ ] T013 [P] Create `backend/src/common/filters/global-exception.filter.ts` — `@Catch()` filter implementing the error envelope `{ success, statusCode, message, errors[], timestamp, path }`; handle HttpException, Prisma P2002/P2025, ValidationError, and generic Error; include requestId from `req['requestId']`; stack trace only in development
- [ ] T014 [P] Create `backend/src/common/interceptors/response.interceptor.ts` — `NestInterceptor` wrapping all success responses in `{ success: true, statusCode, message, data, meta: null }` envelope; JSDoc on class and `intercept()` method
- [ ] T015 [P] Create `backend/src/common/guards/rbac.guard.ts` — `CanActivate` skeleton that always returns `true` for Sprint 1 (no enforcement); add `// TODO Sprint 2: implement resource:action check` comment; JSDoc on class and `canActivate()` method
- [ ] T016 Create `backend/src/database/prisma.service.ts` — extends `PrismaClient`, implements `OnModuleInit` with `$connect()` and `OnModuleDestroy` with `$disconnect()`; JSDoc on all public methods
- [ ] T017 Create `backend/src/database/database.module.ts` — `@Global()` module exporting `PrismaService`; import `ConfigModule`
- [ ] T018 Create `backend/prisma/schema.prisma` — datasource PostgreSQL + generator client + `User` model (`id String @id @default(cuid())`, `email String @unique`, `password String`, `createdAt/updatedAt DateTime`, `deletedAt DateTime?`, `@@map("users")`)
- [ ] T019 Create `backend/src/app.module.ts` — import `ConfigModule`, `DatabaseModule`, `WinstonModule.forRootAsync(...)`, `ThrottlerModule.forRootAsync(...)`, `HealthModule`; apply `RequestIdMiddleware` for all routes; register `RbacGuard` as global guard via `APP_GUARD`
- [ ] T020 Create `backend/src/main.ts` — bootstrap in correct order: `setGlobalPrefix('api/v1')`, `useGlobalPipes(ValidationPipe { whitelist, forbidNonWhitelisted, transform })`, `useGlobalFilters(GlobalExceptionFilter)`, `useGlobalInterceptors(ResponseInterceptor)`, `SwaggerModule.setup('api/docs', ...)` with BearerAuth and API metadata, `app.listen(PORT)`

### 2B — Frontend Scaffold

- [ ] T021 Initialize Vite 5 React TypeScript project in `frontend/` using: `pnpm create vite@5 frontend --template react-ts`; remove boilerplate files (`App.css`, `assets/react.svg`, placeholder content)
- [ ] T022 [P] Install frontend dependencies: `pnpm --filter frontend add react-router-dom axios @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react`
- [ ] T023 [P] Install and configure Tailwind CSS 3: `pnpm --filter frontend add -D tailwindcss@3 postcss autoprefixer`; run `npx tailwindcss init -p`; configure `frontend/tailwind.config.ts` with `darkMode: 'class'`, `content: ['./index.html', './src/**/*.{ts,tsx}']`; add Tailwind directives to `frontend/src/index.css`
- [ ] T024 [P] Install shadcn/ui base components — run `pnpm dlx shadcn-ui@latest init` in `frontend/`; add components: `button`, `card`, `input`, `toast`, `dialog`, `table`; output to `frontend/src/components/ui/`
- [ ] T025 Create `frontend/src/lib/utils.ts` — export `cn()` helper using `clsx` + `tailwind-merge` (shadcn/ui pattern); JSDoc on function
- [ ] T026 Create `frontend/src/lib/axios.ts` — single Axios instance with `baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000'`; request interceptor attaches `Bearer ${localStorage.getItem('accessToken')}`; response error interceptor redirects to `/login` on 401; JSDoc on module
- [ ] T027 Create `frontend/vite.config.ts` — configure `@vitejs/plugin-react`, define `server: { port: 5173, host: true }`, alias `@` → `./src`

**Checkpoint**: Backend compiles (`pnpm --filter backend build`). Frontend starts (`pnpm --filter frontend dev`).

### 2C — Docker & Root Config

- [ ] T028 Create `docker-compose.yml` at repo root — 4 services: `postgres` (postgres:16-alpine, healthcheck `pg_isready`, volume `pgdata`), `redis` (redis:7-alpine, healthcheck `redis-cli ping`), `backend` (volume mount `./backend:/app`, `depends_on postgres/redis: condition: service_healthy`, runs `pnpm start:dev`), `frontend` (volume mount `./frontend:/app`, runs `pnpm dev -- --host`)
- [ ] T029 [P] Create `backend/Dockerfile.dev` — `FROM node:20-alpine`, install pnpm, `WORKDIR /app`, `COPY package.json pnpm-lock.yaml ./`, `RUN pnpm install`, `CMD ["pnpm", "start:dev"]`
- [ ] T030 [P] Create `frontend/Dockerfile.dev` — same pattern as T029, `CMD ["pnpm", "dev", "--", "--host"]`
- [ ] T031 [P] Create `docker-compose.prod.yml` at repo root — 3 services: `postgres`, `redis`, `backend` (multi-stage build from `backend/Dockerfile`, runs `pnpm start:prod`)
- [ ] T032 [P] Create `backend/Dockerfile` (production multi-stage) — Stage 1 `builder`: install deps + `pnpm build`; Stage 2 `runner`: copy `dist/` only, `NODE_ENV=production`, `CMD ["node", "dist/main"]`

**Checkpoint**: `docker-compose up -d` starts all 4 containers without errors.

---

## Phase 3: User Story 1 — Developer Clones & Runs the Boilerplate (Priority: P1) 🎯 MVP

**Goal**: System starts with `docker-compose up`; health endpoints respond; Swagger loads; `.env.example` is complete.
**Independent Test**: Run `curl http://localhost:3000/api/v1/health` → confirm `{ "success": true, "data": { "status": "ok", "db": "ok", "redis": "ok" } }`. Navigate to `http://localhost:3000/api/docs` → Swagger UI loads with Bearer Auth.

### Unit Tests for User Story 1

> Write tests FIRST — verify they FAIL before implementing HealthService

- [ ] T033 [P] [US1] Create `backend/src/database/prisma.service.spec.ts` — unit test: mock PrismaClient; test `onModuleInit` calls `$connect()`; test `onModuleDestroy` calls `$disconnect()`
- [ ] T034 [P] [US1] Create `backend/src/modules/health/health.service.spec.ts` — unit test: mock `PrismaService.$queryRaw` and Redis TCP check; test `checkDb()` returns `'ok'` on resolve and `'error'` on reject; test `checkRedis()` similarly

### E2E Tests for User Story 1

- [ ] T035 [P] [US1] Create `backend/test/health.e2e-spec.ts` — using Supertest + NestJS `TestingModule`; test `GET /api/v1/health` → 200, success envelope, `data.status === 'ok'`; test `GET /api/v1/health/db` → 200, envelope present; test `GET /api/v1/health/redis` → 200, envelope present; test rate-limit `GET /api/v1/health` 101 times → last response 429 error envelope

### Implementation for User Story 1

- [ ] T036 [US1] Create `backend/src/modules/health/health.service.ts` — `HealthService` with three public methods: `checkAll()`, `checkDb()` (calls `prisma.$queryRaw\`SELECT 1\``), `checkRedis()` (TCP ping via `net.createConnection` to Redis host:port); inject `PrismaService` and `ConfigService`; JSDoc on class and all methods; returns `HealthStatusDto` shape
- [ ] T037 [US1] Create `backend/src/modules/health/health.controller.ts` — `@Controller('health')`; three handlers `GET /`, `GET /db`, `GET /redis`; `@ApiTags('Health')`, `@ApiOperation(...)`, `@ApiResponse({ status: 200, type: HealthStatusDto })` on each; `@SkipThrottle()` NOT applied (rate limit stays active); inject `HealthService`; JSDoc on class and handlers
- [ ] T038 [US1] Create `backend/src/modules/health/health.module.ts` — import `DatabaseModule`; provide `HealthService`; declare `HealthController`
- [ ] T039 [US1] Configure Winston logger in `backend/src/app.module.ts` — `WinstonModule.forRootAsync` using `ConfigService`; development: `printf` format with `[timestamp] [LEVEL] [requestId] message`; production: `json()` format + file transports to `logs/error.log` and `logs/combined.log`; suppress output in `test` env
- [ ] T040 [US1] Configure Swagger in `backend/src/main.ts` — `DocumentBuilder` with title `'NestJS Scaffolding Dashboard API'`, version `'1.0'`, description, `addBearerAuth()`; `SwaggerModule.createDocument(app, config)`; `SwaggerModule.setup('api/docs', app, document, { swaggerOptions: { persistAuthorization: true } })`
- [ ] T041 [US1] Run `pnpm --filter backend prisma migrate dev --name init` — verify migration file created in `backend/prisma/migrations/`; commit migration file

**Checkpoint**: `curl http://localhost:3000/api/v1/health` returns full success envelope. Swagger UI at `/api/docs` shows Health tag with 3 endpoints.

---

## Phase 4: User Story 2 — Developer Navigates the Frontend Shell (Priority: P2)

**Goal**: `/login` renders a form; `/dashboard` is protected by `ProtectedRoute` (redirects to `/login` if no token); layout renders with collapsible sidebar and header with dark mode toggle.
**Independent Test**: Visit `localhost:5173/login` — login form visible. Set `localStorage.setItem('accessToken', 'mock')` in browser console. Visit `/dashboard` — layout renders. Toggle dark mode — refresh — dark mode persists.

### Implementation for User Story 2

- [ ] T042 [P] [US2] Create `frontend/src/hooks/useTheme.ts` — React hook reading `localStorage.getItem('theme')`; toggles `document.documentElement.classList.toggle('dark', isDark)`; persists to localStorage; exports `{ isDark, toggleTheme }`; JSDoc on hook and return type
- [ ] T043 [P] [US2] Create `frontend/src/hooks/useToast.ts` — thin wrapper around shadcn/ui toast hook; exports `{ toast }` with helper methods `toast.success(msg)`, `toast.error(msg)`; JSDoc
- [ ] T044 [US2] Create `frontend/src/components/ProtectedRoute.tsx` — checks `localStorage.getItem('accessToken')`; if absent renders `<Navigate to="/login" replace />`; if present renders `<Outlet />`; JSDoc on component
- [ ] T045 [US2] Create `frontend/src/components/LoadingSpinner.tsx` — Tailwind-animated spinner SVG component; accepts optional `size` and `className` props; JSDoc on component and props
- [ ] T046 [P] [US2] Create `frontend/src/components/layout/Sidebar.tsx` — collapsible sidebar with nav links placeholder (`Dashboard`); uses shadcn/ui primitives; accepts `collapsed: boolean` and `onToggle: () => void` props; uses Lucide icons; JSDoc
- [ ] T047 [P] [US2] Create `frontend/src/components/layout/Header.tsx` — top header with: dark mode toggle button (calls `toggleTheme` from `useTheme`), user menu placeholder (avatar + dropdown); JSDoc on component and props
- [ ] T048 [US2] Create `frontend/src/components/layout/AppLayout.tsx` — compose `Sidebar` + `Header` + `<main>` content area; manage `sidebarCollapsed` state; apply `dark` class from `useTheme`; render `<Outlet />` in main; JSDoc
- [ ] T049 [US2] Create `frontend/src/pages/LoginPage.tsx` — login form using shadcn/ui `Card`, `Input`, `Button`; form state with `useState`; on submit calls Axios POST (placeholder endpoint); on error shows `toast.error`; on success stores token in localStorage and navigates to `/dashboard`; JSDoc
- [ ] T050 [US2] Create `frontend/src/pages/DashboardPage.tsx` — placeholder page rendered inside `AppLayout`; displays welcome heading and `LoadingSpinner` (to verify component renders); JSDoc
- [ ] T051 [US2] Create `frontend/src/App.tsx` — React Router v6 `<BrowserRouter>` with routes: `/ → navigate to /dashboard`, `/login → LoginPage`, `/dashboard → ProtectedRoute → AppLayout → DashboardPage`; wrap app with shadcn/ui `<Toaster />`; JSDoc
- [ ] T052 [US2] Update `frontend/src/main.tsx` — wrap `<App />` with `<React.StrictMode>`; import `./index.css`; JSDoc on module
- [ ] T053 [US2] Update `frontend/index.html` — set `<title>NestJS Scaffolding Dashboard</title>`; meta description; meta viewport; favicon placeholder link

**Checkpoint**: `pnpm --filter frontend dev` starts. Visit `/login` → form renders. Set mock token → `/dashboard` → layout renders with sidebar and header. Toggle dark mode → refresh → persists.

---

## Phase 5: User Story 3 — Developer Inspects Logs & Observability (Priority: P3)

**Goal**: Every API request has a `requestId` in logs. Errors produce structured JSON log entries. Frontend shows toast on API error.
**Independent Test**: Send `POST http://localhost:3000/api/v1/health` (wrong method) → backend log shows JSON with `requestId`, `statusCode: 405`, `path`, `message`. Browser toast appears with error text.

### Implementation for User Story 3

- [ ] T054 [US3] Create `backend/src/common/middleware/request-id.middleware.ts` — verify it's complete (task T012 created the file); write unit test `backend/src/common/middleware/request-id.middleware.spec.ts` — mock `req`, `res`, `next`; assert `req['requestId']` is a non-empty string; assert `res.setHeader('X-Request-ID', ...)` called
- [ ] T055 [US3] Create `backend/src/common/filters/global-exception.filter.spec.ts` — unit test for `GlobalExceptionFilter`: test HttpException → correct statusCode; test `P2002` Prisma error → 409; test `P2025` → 404; test generic Error → 500; test stack not exposed when `NODE_ENV=production`; test `requestId` field present in response
- [ ] T056 [US3] Create `backend/src/common/interceptors/response.interceptor.spec.ts` — unit test for `ResponseInterceptor`: mock `ExecutionContext` and `CallHandler`; assert output wraps in `{ success: true, statusCode, message, data }` envelope
- [ ] T057 [P] [US3] Update `frontend/src/lib/axios.ts` — verify response error interceptor is complete (task T026); add `toast.error(error.response?.data?.message ?? 'An error occurred')` call inside the 401 handler before redirect; ensure non-401 errors also call `toast.error`; add JSDoc update

**Checkpoint**: Hit any non-existent route → backend logs show `{ requestId, statusCode, path, message }` in JSON. Frontend shows error toast for API failures.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final wiring, validation, documentation cleanup, and coverage confirmation

- [ ] T058 [P] Create `backend/jest.config.ts` — configure Jest with `ts-jest`, `rootDir: 'src'`, `moduleNameMapper` for `@common/*` etc., `coverageThreshold: { global: { lines: 70, branches: 70 } }`
- [ ] T059 [P] Create `backend/test/jest-e2e.json` — extend base Jest config; set `testRegex: '.e2e-spec.ts$'`; set `testEnvironment: 'node'`
- [ ] T060 [P] Add `backend/package.json` scripts: `"start:dev": "nest start --watch"`, `"build": "nest build"`, `"test": "jest"`, `"test:e2e": "jest --config test/jest-e2e.json"`, `"test:cov": "jest --coverage"`, `"lint": "eslint \"{src,test}/**/*.ts\""`, `"format": "prettier --write \"src/**/*.ts\""`
- [ ] T061 [P] Add `frontend/package.json` scripts: `"dev": "vite"`, `"build": "tsc && vite build"`, `"lint": "eslint src --ext ts,tsx"`, `"format": "prettier --write src"`
- [ ] T062 Run `pnpm --filter backend test:cov` — confirm coverage ≥ 70%; fix any failing tests or gaps
- [ ] T063 Run `pnpm --filter backend test:e2e` — confirm all 3 health endpoints pass + rate-limit test passes (requires Docker Compose running)
- [ ] T064 [P] Run `pnpm lint` from repo root — confirm zero ESLint errors across backend and frontend
- [ ] T065 [P] Verify `pnpm --filter backend build` succeeds with zero TypeScript errors; verify no `any` types remaining
- [ ] T066 [P] Run quickstart validation: follow every step in `specs/001-nestjs-react-foundation/quickstart.md` on a clean terminal session; confirm clone-to-running completes in under 5 minutes
- [ ] T067 Append `history.md` entry at repo root: `## [timestamp] - Feature 001 Implementation Complete` with bullet list of all phases completed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately; T001–T005 in parallel after T001
- **Phase 2A (Backend Scaffold)**: Depends on Phase 1 (T001). T006–T007 sequential; T008–T009 parallel; T010–T020 in order (config before app.module before main.ts)
- **Phase 2B (Frontend Scaffold)**: Depends on Phase 1 (T001). Can run in parallel with 2A — different files. T021 sequential; T022–T024 parallel; T025–T027 parallel
- **Phase 2C (Docker)**: Depends on Phase 2A + 2B (needs Dockerfiles). T028 depends on T029/T030; T029/T030/T031/T032 parallel
- **Phase 3 (US1)**: Depends on Phase 2 complete — BLOCKS. Tests (T033–T035) before implementation (T036–T041)
- **Phase 4 (US2)**: Depends on Phase 2 complete. Can start in parallel with Phase 3 — different files
- **Phase 5 (US3)**: Depends on Phase 3 (request-id middleware must exist). Can start after T012 and T013 are confirmed complete
- **Phase 6 (Polish)**: Depends on Phases 3–5 all complete

### User Story Dependencies

- **US1 (P1)**: Foundational complete → start immediately
- **US2 (P2)**: Foundational complete → can run in parallel with US1 (no shared files)
- **US3 (P3)**: US1 complete (request-id and exception filter must be in place)

### Parallel Opportunities per Phase

```bash
# Phase 2A — after T006/T007, run T008+T009 together, then T010+T011 together, then:
pnpm --filter backend run (T012, T013, T014, T015) in parallel  # common/* — different files

# Phase 2B — all parallel:
pnpm --filter frontend run (T022, T023, T024) in parallel        # deps + tailwind + shadcn

# Phase 3 — tests before implementation:
pnpm run (T033, T034, T035) in parallel                          # all test files different
# then:
pnpm run (T036, T037, T038) with T036 → T037 dependency

# Phase 4 — high parallelism:
pnpm run (T042, T043) in parallel                                # hooks
pnpm run (T046, T047) in parallel                                # layout components
pnpm run (T049, T050) after T048 AppLayout                       # pages
```

---

## Implementation Strategy

### MVP First — User Story 1 Only (P1)

1. Complete Phase 1 (Setup)
2. Complete Phase 2A + 2C (Backend scaffold + Docker — skip 2B)
3. Complete Phase 3 (US1: health endpoints + Swagger)
4. **STOP and VALIDATE**: `curl http://localhost:3000/api/v1/health` → ✅ success envelope
5. Check coverage: `pnpm --filter backend test:cov` → ✅ ≥ 70%

### Incremental Delivery

1. Setup + Foundational → Docker running
2. US1 → Health API + Swagger ✅ (deliverable: working API)
3. US2 → Frontend shell ✅ (deliverable: login + dashboard layout)
4. US3 → Observability ✅ (deliverable: structured logs + toasts)
5. Polish → coverage gate + lint gate ✅ (deliverable: PR-ready codebase)

### Parallel Team Strategy

With two developers:
- **Dev A**: Phase 2A (Backend) → Phase 3 (US1 health API + tests) → Phase 5 (US3 observability)
- **Dev B**: Phase 2B (Frontend) → Phase 4 (US2 shell + routing) → Phase 6 polish

---

## Notes

- **[P]** tasks = different files, no racing dependencies — safe to run in parallel
- **[US1/US2/US3]** maps each task to the user story it delivers
- All tests (spec.ts) MUST be written before implementation and verified to FAIL first (Red phase)
- Run `prisma migrate dev` (T041) only after Docker Compose is up and `DATABASE_URL` is set
- shadcn/ui `init` (T024) is interactive — use `--yes` flag or answer prompts: style=default, baseColor=slate, cssVariables=yes, tailwindConfig=tailwind.config.ts
- Commit `history.md` update (T067) last — after all other tasks are done and verified
