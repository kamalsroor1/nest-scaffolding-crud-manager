/speckit.constitution Create governing principles for a NestJS + React scaffolding dashboard project with the following focus areas:

CODE QUALITY:
- Strict TypeScript everywhere (no 'any' types)
- ESLint + Prettier enforced
- SOLID principles applied to all modules
- Every public method must have JSDoc comments

ARCHITECTURE:
- NestJS modular architecture — each feature is a self-contained module
- Repository pattern for all database access (Prisma)
- DTOs for all input/output with class-validator decorators
- Dependency Injection everywhere — no direct instantiation

TESTING STANDARDS:
- Unit tests for every Service method (Jest)
- Integration tests for every Controller endpoint
- E2E tests for critical flows (Auth, CRUD Generator)
- Minimum 70% code coverage enforced in CI

API DESIGN:
- All endpoints prefixed with /api/v1/
- Unified response format: { success, statusCode, message, data, meta }
- Unified error format: { success, statusCode, message, errors[], timestamp, path }
- Swagger documentation mandatory for every endpoint

SECURITY:
- JWT Access Token (15min) + Refresh Token (7 days)
- RBAC with granular permissions (resource:action format)
- Input validation via Global Validation Pipe
- Rate limiting on all public endpoints
- Soft delete only — never hard delete user data

FRONTEND:
- React with TypeScript + Vite
- Tailwind CSS + shadcn/ui components
- Axios with interceptors for token refresh
- Protected routes based on permissions
- Toast notifications for all user actionsconstitution 

GENERATOR STANDARDS:
- Generated code must follow identical patterns to handwritten code
- All templates must include Swagger decorators
- Auto-registration in AppModule must not break existing modules
- Generated frontend pages must use the same DataTable and Form components
