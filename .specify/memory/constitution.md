<!--
  SYNC IMPACT REPORT
  ==================
  Version change: 1.0.0 → 1.1.0 (MINOR — new principle added)
  Last Amended: 2026-04-10

  Amendment: Added Principle VIII — Agent Workflow & Tracking
  - Mandates a root-level `history.md` audit log maintained by any agent or developer.
  - Every implementation action, file modification, command execution, or task
    completion MUST be appended to history.md with a timestamped section header
    and a bulleted summary of changes.

  Modified principles: none (existing I–VII unchanged)

  Added sections:
  - VIII. Agent Workflow & Tracking (NON-NEGOTIABLE)

  Templates requiring updates:
  - .specify/templates/plan-template.md  ✅ updated — Gate VIII added to Constitution Check
  - .specify/templates/spec-template.md  ✅ previously updated (v1.0.0, no change needed)
  - .specify/templates/tasks-template.md ✅ previously updated (v1.0.0, no change needed)

  New files created:
  - history.md (root) — initial audit log entry created by this amendment run

  Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Confirm the precise date the team formally adopted this
    constitution (marked as 2026-04-10 based on creation date).
-->

# NestJS Scaffolding Dashboard Constitution

## Core Principles

### I. Code Quality (NON-NEGOTIABLE)

Every line of code produced in this project — handwritten or generated — MUST meet the
following standards:

- **TypeScript strict mode** is mandatory across all packages. The `any` type is
  forbidden; use `unknown` + narrowing or properly typed generics instead.
- **ESLint + Prettier** configuration is the source of truth for style. No PR may
  introduce lint or formatting violations. CI MUST fail on any violation.
- **SOLID principles** MUST be applied to every module, class, and function. Single
  Responsibility is the primary concern; no "god classes" or "god services".
- **Every public method and public class** MUST have a JSDoc comment that describes
  its purpose, parameters, return value, and any thrown exceptions. Private helpers
  MAY omit JSDoc but MUST have clear naming.

**Rationale**: Consistent quality reduces onboarding friction and ensures that both
the handwritten scaffold and auto-generated code are maintainable by any team member.

### II. Modular Architecture (NON-NEGOTIABLE)

The backend MUST follow NestJS modular decomposition; the frontend MUST follow
feature-based organization:

- Each backend feature is a **self-contained NestJS module** (`Module`, `Controller`,
  `Service`, repository, DTOs, entities). Cross-module dependencies are injected via
  providers — never imported directly.
- **Repository pattern** is mandatory for all database access. Raw Prisma client
  calls are permitted only inside repository classes. Services MUST not call
  `prisma.*` directly.
- **DTOs** (Data Transfer Objects) are required for every request body, query
  parameter set, and response shape. All DTOs MUST use `class-validator` decorators.
  `class-transformer` MUST be applied globally via `ValidationPipe`.
- **Dependency Injection** is the only acceptable instantiation mechanism. `new
  SomeService()` inside application code is forbidden; use NestJS providers.

**Rationale**: Modular isolation enables the CRUD Generator to safely add new modules
without touching unrelated code, and keeps the codebase navigable as it grows.

### III. Testing Discipline (NON-NEGOTIABLE)

Testing requirements apply equally to handwritten code and to code emitted by the
generator:

- **Unit tests (Jest)** MUST be written for every public method of every `Service`
  class. Tests live next to their subject in `*.spec.ts` files.
- **Integration tests** MUST cover every `Controller` endpoint (using NestJS
  `supertest` + `TestingModule`). Integration test files follow `*.e2e-spec.ts` in a
  `/test` directory.
- **E2E tests** are required for the two most critical flows: **Authentication** (login,
  token refresh, logout) and the **CRUD Generator** (generate → migrate → verify
  generated endpoints).
- **Minimum 70% code coverage** (lines + branches) MUST be enforced in CI. PRs that
  drop aggregate coverage below 70% MUST be rejected automatically.

**Rationale**: Without this gate, the generator could silently produce broken modules,
and regressions in Auth or core services would reach production undetected.

### IV. API Contract (NON-NEGOTIABLE)

All HTTP endpoints exposed by this project — handwritten or generated — MUST conform
to the following contract:

- **Route prefix**: every endpoint MUST be prefixed with `/api/v1/`.
- **Success envelope**:
  ```json
  { "success": true, "statusCode": 200, "message": "...", "data": {}, "meta": {} }
  ```
- **Error envelope**:
  ```json
  {
    "success": false, "statusCode": 400, "message": "...",
    "errors": [], "timestamp": "ISO8601", "path": "/api/v1/..."
  }
  ```
- **Swagger documentation** is mandatory for every endpoint using
  `@ApiTags`, `@ApiOperation`, `@ApiResponse`, and `@ApiBearerAuth` (where
  applicable). The generator templates MUST include these decorators.

**Rationale**: A consistent envelope allows frontend clients and third-party consumers
to write generic response/error handlers, reducing integration bugs.

### V. Security (NON-NEGOTIABLE)

Security controls are architectural, not optional features:

- **JWT tokens**: Access tokens expire in **15 minutes**; Refresh tokens expire in
  **7 days** and are stored server-side (Redis or DB) for revocation support.
- **RBAC**: Permissions use the `resource:action` format (e.g., `users:read`,
  `products:delete`). Guards MUST be applied at controller or handler level; no
  endpoint may be publicly writable without explicit annotation.
- **Global ValidationPipe** MUST be registered in `main.ts` with
  `{ whitelist: true, forbidNonWhitelisted: true, transform: true }`.
- **Rate limiting** (Throttler) MUST be applied to all public (unauthenticated)
  endpoints. Authenticated endpoints MAY use relaxed limits but MUST not be
  unlimited.
- **Soft delete only**: no entity in this system may be permanently deleted via a
  normal API call. All deletions MUST set a `deletedAt` timestamp. Hard deletes are
  reserved for administrative data-retention scripts only.

**Rationale**: The scaffold serves as the foundation for production systems. Security
defaults that require opt-out are safer than security features that require opt-in.

### VI. Frontend Standards

The React dashboard MUST follow these standards:

- **Stack**: React + TypeScript (strict) + Vite. No JavaScript-only files permitted.
- **UI layer**: Tailwind CSS for utilities; `shadcn/ui` for component primitives.
  Custom components MUST be built on top of shadcn primitives, not alongside them.
- **HTTP layer**: A single configured Axios instance with request/response interceptors
  handling token injection and 401-triggered refresh flows. Raw `fetch` is forbidden
  in feature code.
- **Routing**: All authenticated routes MUST be wrapped in a `ProtectedRoute`
  component that checks both authentication state and required permission. Unauthenticated
  access MUST redirect to the login page.
- **User feedback**: Every user-initiated action that calls the API MUST display a
  toast notification on success AND on failure. Silent failures are not acceptable.

**Rationale**: Consistent UI patterns ensure that generated pages are indistinguishable
from handwritten ones, and that the dashboard provides a predictable UX.

### VII. Generator Parity (NON-NEGOTIABLE)

The CRUD Generator is a first-class feature; its output MUST meet the same standards
as handwritten code:

- Generated backend modules MUST follow the exact same file structure, naming
  conventions, and patterns as handwritten modules (Module / Controller / Service /
  Repository / DTOs / entity).
- Generated controller files MUST include all required Swagger decorators
  (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`).
- Generator auto-registration in `AppModule` MUST use append-only AST manipulation.
  It MUST NOT remove, reorder, or modify existing imports or module declarations.
- Generated frontend pages MUST use the shared `DataTable` and `Form` components.
  The generator MUST NOT create one-off table or form implementations.

**Rationale**: If generator output diverges from handwritten patterns, the scaffold
loses its value proposition and technical debt accumulates immediately.

### VIII. Agent Workflow & Tracking (NON-NEGOTIABLE)

Every agent (AI assistant, automated script, or developer acting in an agent capacity)
MUST maintain a persistent audit trail of all actions taken in this project:

- A file named **`history.md`** MUST exist at the repository root at all times.
  It is created on first action if absent; it is NEVER deleted or truncated.
- **Every action** — feature implementation, file modification, command execution,
  task completion, or constitution amendment — MUST be appended to `history.md`
  immediately after the action completes. Pre-action logging is not acceptable.
- Each entry MUST follow this exact format:
  ```markdown
  ## YYYY-MM-DDTHH:MM:SS+TZ - [Task/Spec Name]

  - [Concise bullet describing what was done]
  - [File(s) created or modified, with relative path]
  - [Commands run, with exit codes if relevant]
  ```
- Entries MUST be appended — never edited or removed after creation. The file
  serves as an immutable audit log.
- `history.md` MUST be committed alongside the changes it describes; it MUST NOT
  be added to `.gitignore`.

**Rationale**: An agent-maintained audit trail is essential for debugging, onboarding,
reviewing automated changes, and reconstructing the sequence of events when things go
wrong. Without it, automated modifications become opaque and unauditable.

## Additional Constraints

### Technology Stack

| Layer | Technology | Version Policy |
|-------|-----------|----------------|
| Backend runtime | Node.js | LTS (≥ 20) |
| Backend framework | NestJS | Latest stable |
| Database ORM | Prisma | Latest stable |
| Database | PostgreSQL | ≥ 15 |
| Cache / Queue | Redis | ≥ 7 |
| Frontend framework | React | ≥ 18 |
| Frontend build | Vite | Latest stable |
| Frontend UI | Tailwind CSS + shadcn/ui | Latest stable |
| Testing | Jest (backend), Vitest (frontend) | Latest stable |
| CI | GitHub Actions | — |

Deviations from this stack MUST be documented in the feature's `plan.md` under
Complexity Tracking with explicit justification.

## Quality Gates

### CI Enforcement

Every pull request MUST pass the following automated gates before merge is permitted:

1. **Lint**: `eslint . --ext .ts,.tsx` exits with code 0.
2. **Format**: `prettier --check .` exits with code 0.
3. **Unit tests**: `jest --coverage` with `≥70%` lines and branches.
4. **Build**: `nest build` (backend) and `vite build` (frontend) succeed without errors.
5. **E2E**: Auth and CRUD Generator E2E test suites pass cleanly.
6. **Audit log**: `history.md` exists at the repository root and contains an entry
   for every task in the current branch's commit range.

### Code Review Requirements

- Every PR touching Auth, RBAC guards, or the generator engine MUST receive a second
  reviewer's approval, not only the author's.
- Generated code changes (template modifications) MUST include a sample of the
  rendered output in the PR description.
- Every PR MUST include a corresponding `history.md` append confirming what was done.

## Governance

This constitution supersedes all other project conventions and informal agreements.
All other rules are subordinate unless explicitly stated to extend (not contradict) this
document.

**Amendment procedure**:
1. Open a GitHub Issue describing the proposed change and its rationale.
2. Label the issue `constitution-amendment`.
3. Discussion period: minimum 48 hours for team review.
4. Approved amendments MUST be committed as a dedicated PR that updates this file,
   increments the version, updates `LAST_AMENDED_DATE`, and propagates changes to
   all dependent templates.
5. Version bumps follow semantic versioning:
   - **MAJOR**: Removal or backward-incompatible redefinition of a principle.
   - **MINOR**: New principle or materially expanded guidance added.
   - **PATCH**: Clarification, wording improvement, typo fix.

**Compliance**: All PRs and code reviews MUST verify constitution compliance. When
doubt exists about whether code meets a principle, the constitution interpretation
takes precedence over any team member's individual preference.

**Runtime guidance**: See `.specify/memory/` for agent-facing operational guidance
and `.specify/templates/` for document templates that must remain in sync with this
constitution.

**Version**: 1.1.0 | **Ratified**: 2026-04-10 | **Last Amended**: 2026-04-10
