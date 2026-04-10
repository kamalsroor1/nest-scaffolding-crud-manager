# Feature Specification: NestJS + React Project Foundation

**Feature Branch**: `001-nestjs-react-foundation`
**Created**: 2026-04-10
**Status**: Draft
**Input**: User description: "Build the foundation of a NestJS + React scaffolding dashboard"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Developer Clones & Runs the Boilerplate (Priority: P1)

A developer clones the repository, copies `.env.example` to `.env`, and starts the
entire system with a single command. Within minutes they have a running backend API,
a working frontend dashboard shell, and a local database + Redis — all connected and
health-checked.

**Why this priority**: This is the core value proposition. If a developer cannot go
from clone to running in under 5 minutes, the boilerplate fails its primary purpose.

**Independent Test**: Clone the repo on a clean machine with Docker installed. Run
the start command. Confirm the health endpoint returns `{ success: true }` and the
browser shows the dashboard login page.

**Acceptance Scenarios**:

1. **Given** a fresh clone and a populated `.env` file, **When** the developer runs
   the Docker Compose start command, **Then** PostgreSQL, Redis, and the NestJS API
   are all reachable within 90 seconds and both frontend and backend serve without errors.
2. **Given** the system is running, **When** the developer navigates to `/api/v1/health`,
   **Then** the response is `{ success: true, statusCode: 200, data: { status: "ok",
   db: "ok", redis: "ok" } }` using the unified success envelope.
3. **Given** the system is running, **When** the developer navigates to `/api/docs`,
   **Then** the Swagger UI is displayed with Bearer Auth configured and API metadata visible.

---

### User Story 2 — Developer Navigates the Frontend Shell (Priority: P2)

A developer opens the browser and sees a polished dashboard shell: a login page
for unauthenticated users, and a protected dashboard layout (sidebar + header) for
authenticated users. Dark mode persists across page refreshes.

**Why this priority**: The frontend shell establishes the visual and structural
contract that all future Sprint features will plug into. It must work before any
feature modules are added.

**Independent Test**: Start the frontend dev server. Visit `/login` — confirm a login
form renders. Manually set a mock auth token in localStorage and visit `/dashboard` —
confirm the layout renders with sidebar and header. Toggle dark mode — confirm it
persists after page refresh.

**Acceptance Scenarios**:

1. **Given** the frontend is running and no auth token exists, **When** the developer
   visits `/dashboard`, **Then** they are immediately redirected to `/login`.
2. **Given** an auth token is present, **When** the developer visits `/dashboard`,
   **Then** the layout renders with a collapsible sidebar, a header with a user menu,
   and a main content area placeholder.
3. **Given** the developer toggles dark mode, **When** they refresh the page,
   **Then** dark mode state is preserved.

---

### User Story 3 — Developer Inspects Logs & Observability (Priority: P3)

A developer runs the system and can easily trace a failed API request from the
frontend toast notification all the way through the structured backend logs, identifying
the error type, request path, and request ID.

**Why this priority**: Debuggability is a quality-of-life feature for the boilerplate
consumer. Important but not blocking for initial delivery.

**Independent Test**: Send an invalid request to any API endpoint. Confirm the frontend
shows an error toast. Confirm the backend logs show a structured JSON error entry with
`requestId`, `statusCode`, `path`, and `message`.

**Acceptance Scenarios**:

1. **Given** the system is running in development mode, **When** an API call returns
   a 4xx error, **Then** the backend log contains a structured JSON entry with
   `requestId`, `statusCode`, `path`, `message`, and `timestamp`.
2. **Given** any API call is made, **When** it completes (success or error), **Then**
   the frontend displays a relevant toast notification to the user.

---

### Edge Cases

- What happens when `DATABASE_URL` is missing or malformed on startup?
  → The Config Module validation (Joi) MUST throw during bootstrap and print a clear
  message listing which variables are invalid. The process must NOT silently start.
- What happens when the database is unreachable at `/api/v1/health/db`?
  → The response MUST still return HTTP 200 but with `db: "error"` in the data
  body, so the health endpoint never causes an alert cascade.
- What happens when an unauthenticated request hits any non-public endpoint?
  → The unified error envelope returns HTTP 401 with `{ success: false, statusCode: 401,
  message: "Unauthorized", errors: [], timestamp: "...", path: "..." }`.
- What happens if a developer forgets to add `NODE_ENV` to `.env`?
  → The Config Module Joi schema MUST default `NODE_ENV` to `"development"` rather
  than failing, since this is a developer convenience variable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST start all services (API, PostgreSQL, Redis, frontend) with a
  single `docker-compose up` command from the project root.
- **FR-002**: The backend MUST validate all required environment variables on startup
  using a Joi schema and halt with a descriptive error if any required variable is
  missing or invalid.
- **FR-003**: The backend MUST expose three health-check endpoints:
  `/api/v1/health`, `/api/v1/health/db`, and `/api/v1/health/redis`, each returning
  the unified success envelope.
- **FR-004**: All backend API responses — success and error — MUST use the project's
  unified envelope formats without exception (enforced globally, not per endpoint).
- **FR-005**: The backend MUST apply a global rate limit of 100 requests per 60 seconds
  to all endpoints by default.
- **FR-006**: Every backend API request MUST generate a unique request ID that appears
  in all log lines associated with that request.
- **FR-007**: Swagger documentation MUST be auto-generated and accessible at `/api/docs`
  with Bearer Auth pre-configured.
- **FR-008**: The frontend MUST guard the `/dashboard` route — any unauthenticated
  visitor is redirected to `/login` immediately.
- **FR-009**: The frontend MUST display a toast notification for every API call outcome
  (success and error) triggered by a user action.
- **FR-010**: Dark mode preference MUST persist across browser sessions using
  localStorage.
- **FR-011**: The frontend HTTP client MUST automatically attach the Bearer token to
  every authenticated request and handle 401 responses by redirecting to `/login`.
- **FR-012**: The Prisma database schema MUST include the initial `User` model with at
  minimum: `id`, `email`, `password`, `createdAt`, `updatedAt`, `deletedAt` (soft delete).
- **FR-013**: An `.env.example` file MUST exist at the project root documenting every
  required and optional environment variable with inline comments.

### Non-Functional Requirements *(constitution-mandated — verify, do not remove)*

The following NFRs apply to every feature by default per the project constitution
(`.specify/memory/constitution.md` v1.1.0). Override only with documented justification.

| NFR | Requirement | Constitution Ref |
|-----|-------------|-----------------|
| NFR-01 | All endpoints MUST be prefixed `/api/v1/` and return the unified success/error envelope | Principle IV |
| NFR-02 | Every endpoint MUST have Swagger decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`) | Principle IV |
| NFR-03 | Access tokens expire in 15 min; Refresh tokens expire in 7 days | Principle V |
| NFR-04 | All delete operations MUST be soft deletes (`deletedAt` timestamp); no hard deletes | Principle V |
| NFR-05 | Public endpoints MUST enforce rate limiting via Throttler guard | Principle V |
| NFR-06 | RBAC guards using `resource:action` format MUST be applied at handler level | Principle V |
| NFR-07 | Unit tests required for every Service method; integration tests for every Controller endpoint | Principle III |
| NFR-08 | Aggregate code coverage MUST remain ≥ 70% lines and branches after this feature | Principle III |
| NFR-09 | All TypeScript files MUST pass ESLint + Prettier with zero suppressions | Principle I |
| NFR-10 | Generated pages MUST use the shared `DataTable` and `Form` components | Principle VII |
| NFR-11 | `history.md` MUST exist at the repo root; every implementation action MUST be appended to it | Principle VIII |

### Key Entities

- **User**: The primary identity entity. Attributes include unique identifier, email
  address (unique), hashed password, timestamps (created, updated), and soft-delete
  timestamp. This entity underpins Auth in Sprint 2.
- **Environment Configuration**: Not a database entity — represents the validated set
  of startup variables consumed by the Config Module. Treated as a typed, immutable
  snapshot available globally at runtime.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer with Docker installed can go from `git clone` to a fully
  running system (API responding, frontend rendering) in under 5 minutes.
- **SC-002**: The health endpoint at `/api/v1/health` returns a 200 response within
  500ms under normal operating conditions.
- **SC-003**: The backend rejects startup within 5 seconds and prints a human-readable
  error message when any required environment variable is missing.
- **SC-004**: 100% of API responses in the foundation layer use the unified
  success/error envelope — zero endpoints return raw or unformatted data.
- **SC-005**: The frontend login-to-dashboard navigation flow completes in under 2
  seconds on a local machine.
- **SC-006**: Dark mode toggle takes effect instantly (under 100ms) and persists
  correctly across at least 3 consecutive browser sessions.
- **SC-007**: The Swagger UI at `/api/docs` loads and displays all documented
  foundation endpoints without errors.
- **SC-008**: Any API call that triggers a rate-limit violation results in a
  standardized 429 response using the unified error envelope within 50ms.

## Assumptions

- Docker Desktop (or Docker Engine) is installed on the developer's machine. The
  boilerplate does not support non-Docker local setup in v1.
- The developer is using a POSIX-compatible shell or PowerShell — no assumption of
  a specific OS for the CLI commands in the quickstart.
- Authentication (JWT issuance and refresh) is **out of scope** for this sprint.
  The frontend auth state is mocked for routing purposes; real auth is Sprint 2.
- The initial Prisma schema contains only the `User` model. Additional models
  are added in subsequent sprints as feature modules land.
- The CRUD Generator is out of scope for this sprint. This sprint only delivers the
  structural foundation the generator will target.
- For Sprint 1, RBAC guards (NFR-06) apply at the framework registration level only
  (the Guard class exists and is registered globally) but no `resource:action`
  permissions are enforced yet since there are no protected resources. This is
  explicitly deferred to Sprint 2 (Auth module).
- Winston log files in production are written to a `logs/` directory at the project
  root. Log rotation is not configured in Sprint 1.
- The production Docker Compose (`docker-compose.prod.yml`) does not include a
  reverse proxy (nginx/Traefik). That is deferred to the deployment sprint.
