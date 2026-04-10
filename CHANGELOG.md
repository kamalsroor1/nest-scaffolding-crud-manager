# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---


## [Unreleased]

### Planned
- GraphQL support alongside REST
- CLI npm package (`npx nest-scaffold`)
- Swagger export to Postman collection
- Multi-language support (i18n)
- WebSocket Gateway template in generator

---

## [1.0.0] — 2025-01-01

### Added
- Initial release

#### Backend (NestJS)
- JWT Authentication with Access + Refresh Token rotation
- HttpOnly Cookie for Refresh Token storage
- Email verification and password reset flow
- Role-Based Access Control (RBAC) with @Roles() decorator
- Granular Permissions system with @Permissions() decorator
- Full User CRUD with soft delete
- Roles & Permissions CRUD with assignment endpoints
- File Upload module — Local storage with S3-ready strategy pattern
- Audit Log interceptor (tracks CREATE / UPDATE / DELETE)
- Global Exception Filter with unified error response format
- Global Response Interceptor with unified success response format
- Generic Pagination helper for all list endpoints
- Redis Cache module setup
- Rate Limiting via @nestjs/throttler
- Winston structured logging
- Health check endpoints (/api/v1/health)
- Swagger / OpenAPI documentation at /api/docs
- Joi-based environment variable validation on startup
- Docker + Docker Compose (PostgreSQL + Redis + API)
- Prisma ORM with PostgreSQL
- Database seed with default roles, permissions, and admin user

#### CRUD Generator
- npm run generate CLI command
- Generates NestJS Module, Controller, Service
- Generates CreateDto + UpdateDto with class-validator decorators
- Generates Swagger decorators on all endpoints
- Auto-appends Prisma model to schema.prisma
- Auto-registers new module in AppModule via ts-morph
- Generates React List Page with DataTable + pagination
- Generates React Create/Edit Form
- Generates Axios API service functions
- Generates TypeScript interfaces
- Supports field types: string, number, int, boolean, date, email, text

#### Frontend (React + Vite)
- Login, Register, Forgot Password, Reset Password pages
- Dashboard layout with Sidebar + Header
- Users Management page (list, create, edit, soft delete)
- Roles Management page with permission assignment
- Profile page with avatar upload
- Reusable DataTable component with sort, search, pagination
- Protected Routes with role-based access
- Dark Mode toggle
- Toast notification system
- Axios instance with automatic token refresh interceptor
- TanStack Query for server state management
- React Hook Form + Zod for form validation

#### Developer Experience
- docker-compose up -d starts everything
- .env.example with all required variables
- GitHub Actions CI — lint + test on every PR
- Postman Collection included
- Full project analysis in /docs (9 documents)

---

## How to read this file

- **Added** — new features
- **Changed** — changes to existing functionality
- **Deprecated** — soon-to-be removed features
- **Removed** — removed features
- **Fixed** — bug fixes
- **Security** — security fixes

[Unreleased]: https://github.com/kamalsroor1/nest-scaffolding-crud-manager/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/kamalsroor1/nest-scaffolding-crud-manager/releases/tag/v1.0.0
