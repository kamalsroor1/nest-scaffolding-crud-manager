# 🚀 خطة بناء NestJS Scaffolding Dashboard باستخدام Spec-Driven Development

> **المنهجية:** Spec-Driven Development بـ Spec Kit من GitHub  
> **الأداة:** Claude Code (AI Agent)  
> **المشروع:** NestJS + React Scaffolding Dashboard + CRUD Generator

---

## 📖 ما هي طريقة Spec-Driven Development؟

بدل ما تبدأ تكتب كود مباشرة، بتكتب **specs** أولاً (مواصفات تفصيلية) وبعدين الـ AI بينفذ على أساسها. النتيجة: كود أنضف، أقل bugs، وأسرع في التنفيذ.

### الـ Flow الأساسي:
```
Constitution → Specify → Clarify → Plan → Tasks → Implement
```

---

## ⚙️ الخطوة صفر: تثبيت الأدوات

### 1. تثبيت `uv` (Python package manager)

```bash
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### 2. تثبيت Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

### 3. تثبيت Specify CLI

```bash
# تثبيت دائم (موصى به)
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v0.4.0
```

### 4. إنشاء المشروع وربطه بـ Spec Kit

```bash
# إنشاء مجلد المشروع
mkdir nestjs-scaffolding-dashboard
cd nestjs-scaffolding-dashboard

# تهيئة Spec Kit مع Claude Code
specify init . --ai claude

# التحقق من التثبيت
specify check
```

بعد هذا الأمر، هيظهر عندك الـ slash commands جوه Claude Code:
- `/speckit.constitution`
- `/speckit.specify`
- `/speckit.clarify`
- `/speckit.plan`
- `/speckit.tasks`
- `/speckit.implement`

### 5. تشغيل Claude Code في مجلد المشروع

```bash
claude
```

---

## 📋 هيكل الـ Specs المطلوبة

المشروع هيتقسم لـ **6 specs** كل واحدة تغطي sprint كامل:

| # | Spec | يقابل |
|---|------|-------|
| 1 | Project Foundation | Sprint 1 |
| 2 | Authentication System | Sprint 2 |
| 3 | Users & RBAC | Sprint 3 |
| 4 | File Upload & Utilities | Sprint 4 |
| 5 | CRUD Generator | Sprint 5-6 |
| 6 | Testing & Polish | Sprint 7-8 |

---

## 🏛️ STEP 0: إنشاء الـ Constitution

الـ Constitution هي المبادئ العامة اللي هتحكم كل الـ specs والكود اللي هيتولد.

### الأمر:

```
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
- Toast notifications for all user actions

GENERATOR STANDARDS:
- Generated code must follow identical patterns to handwritten code
- All templates must include Swagger decorators
- Auto-registration in AppModule must not break existing modules
- Generated frontend pages must use the same DataTable and Form components
```

---

## 📝 SPEC 1: Project Foundation

### الـ Prompt للـ `/speckit.specify`:

```
/speckit.specify Build the foundation of a NestJS + React scaffolding dashboard called "NestJS Scaffolding Dashboard".

WHAT WE'RE BUILDING:
A production-ready boilerplate system that developers can clone to start any new NestJS + React project. The foundation includes the project structure, configuration, global middleware, and Docker setup.

BACKEND REQUIREMENTS (NestJS):
- Project initialized with NestJS CLI with the following folder structure:
  src/
  ├── common/           (shared utilities, decorators, filters, interceptors)
  ├── config/           (environment configuration)
  ├── database/         (Prisma setup and migrations)
  └── modules/          (feature modules go here)

- Config Module: Load and validate environment variables using Joi schema. Variables include: DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, REDIS_URL, PORT, NODE_ENV, THROTTLE_TTL, THROTTLE_LIMIT

- Global Exception Filter: Catches ALL exceptions and returns unified error response format. Handles: HttpException, Prisma errors (unique constraint, not found), validation errors, and unexpected errors.

- Global Response Interceptor: Wraps ALL successful responses in the unified success format automatically.

- Global Validation Pipe: Enabled globally with whitelist:true, forbidNonWhitelisted:true, transform:true.

- Winston Logger: Structured logging with levels (error, warn, info, debug). Log to console in development, log to files in production. Include request ID in every log line.

- Health Check Module: Three endpoints:
  - GET /api/v1/health → overall status
  - GET /api/v1/health/db → PostgreSQL connection status
  - GET /api/v1/health/redis → Redis connection status

- Swagger Setup: Auto-generated docs at /api/docs with Bearer Auth configured. Include API title, version, and description.

- Rate Limiting: ThrottlerModule configured globally. Default: 100 requests per 60 seconds.

- Prisma Setup: PostgreSQL connection. Initial schema with just User model (for next sprint).

FRONTEND REQUIREMENTS (React):
- Vite + React + TypeScript project
- Tailwind CSS configured
- shadcn/ui installed with base components (Button, Card, Input, Toast, Dialog, Table)
- React Router v6 with basic routes: / (redirect to /dashboard), /login, /dashboard (protected)
- Axios instance configured with: base URL from env, request interceptor to attach Bearer token, response interceptor to handle 401 errors
- Dark mode toggle (persisted in localStorage)
- Layout component: Sidebar (collapsible) + Header with user menu + main content area
- Loading spinner component

DOCKER:
- docker-compose.yml with three services: postgres (PostgreSQL 16), redis (Redis 7), app (NestJS with hot-reload)
- .env.example with all required variables documented
- Separate docker-compose.prod.yml for production

WHY THIS MATTERS:
Every developer who uses this boilerplate saves 8-12 hours of setup time on every new project. The foundation must be solid enough that Sprint 2-6 can build on top of it without restructuring anything.
```

### أمر الـ Clarify:

```
/speckit.clarify
```

بعد الـ clarify، هتجاوب على أي أسئلة بيسألها الـ AI عن تفاصيل مش واضحة.

### أمر الـ Plan:

```
/speckit.plan Use the following tech stack:
- Backend: NestJS 10, TypeScript 5, Prisma 5, PostgreSQL 16
- Validation: class-validator + class-transformer
- Logging: Winston with nest-winston
- Config: @nestjs/config + Joi
- Health: @nestjs/terminus
- Swagger: @nestjs/swagger
- Rate Limiting: @nestjs/throttler
- Frontend: React 18, TypeScript 5, Vite 5, Tailwind CSS 3, shadcn/ui, React Router v6, Axios
- Docker: docker-compose v3.8
- Package Manager: pnpm (for both backend and frontend)
- Monorepo structure: root package.json with workspaces for /backend and /frontend
```

### أمر الـ Tasks:

```
/speckit.tasks
```

### أمر الـ Implement:

```
/speckit.implement
```

### ✅ Acceptance Criteria للـ Spec 1:
- [ ] `docker-compose up` يشغل Postgres + Redis + App بدون errors
- [ ] `GET /api/v1/health` يرجع `{ status: "ok" }`
- [ ] `/api/docs` يفتح Swagger UI
- [ ] أي endpoint غير موجود يرجع الـ error format الصح
- [ ] Frontend يفتح على port 5173 مع dark mode يشتغل

---

## 📝 SPEC 2: Authentication System

### الـ Prompt للـ `/speckit.specify`:

```
/speckit.specify Build a complete authentication system for the NestJS Scaffolding Dashboard.

WHAT WE'RE BUILDING:
A secure, production-ready authentication module that handles user registration, login, token management, and password recovery. This is the security backbone of the entire system.

BACKEND REQUIREMENTS:

User Entity (Prisma):
- id: UUID (auto-generated)
- email: String (unique, lowercase)
- password: String (bcrypt hashed, never returned in responses)
- firstName: String
- lastName: String
- isEmailVerified: Boolean (default: false)
- isActive: Boolean (default: true)
- emailVerificationToken: String? (nullable)
- passwordResetToken: String? (nullable)
- passwordResetExpires: DateTime? (nullable)
- refreshTokens: RefreshToken[] (relation)
- createdAt: DateTime
- updatedAt: DateTime
- deletedAt: DateTime? (soft delete)

RefreshToken Entity:
- id: UUID
- token: String (hashed)
- userId: UUID (relation to User)
- expiresAt: DateTime
- revokedAt: DateTime? (nullable)
- createdAt: DateTime

Auth Endpoints:
1. POST /api/v1/auth/register
   - Body: { email, password, firstName, lastName }
   - Validates: email format, password min 8 chars with uppercase+number+special, unique email
   - Creates user with hashed password
   - Sends verification email (mock/log in development)
   - Returns: { user: UserResponseDto } (NO tokens until email verified — or make verification optional via env flag REQUIRE_EMAIL_VERIFICATION)

2. POST /api/v1/auth/login
   - Body: { email, password }
   - Returns: { accessToken, refreshToken, expiresIn: 900, user: UserResponseDto }
   - Access Token: JWT, expires 15 minutes, payload: { sub: userId, email, roles }
   - Refresh Token: opaque random string (64 chars), hashed before storage, expires 7 days

3. POST /api/v1/auth/logout
   - Requires: Bearer access token
   - Body: { refreshToken }
   - Revokes the refresh token
   - Returns: { message: "Logged out successfully" }

4. POST /api/v1/auth/refresh
   - Body: { refreshToken }
   - Validates token exists, not revoked, not expired
   - Returns new accessToken + new refreshToken (rotation)
   - Revokes old refresh token

5. POST /api/v1/auth/forgot-password
   - Body: { email }
   - Generates secure reset token (32 bytes hex), expires 1 hour
   - Sends password reset email (mock/log in development)
   - Always returns 200 (don't reveal if email exists)

6. POST /api/v1/auth/reset-password
   - Body: { token, newPassword }
   - Validates token is valid and not expired
   - Updates password, clears reset token
   - Revokes ALL refresh tokens for this user (security)

7. POST /api/v1/auth/verify-email
   - Body: { token }
   - Marks user email as verified

JWT Strategy (Passport):
- AccessTokenStrategy: validates JWT signature and expiry, attaches user to request
- JwtAuthGuard: applied globally, endpoints opt-out with @Public() decorator

UserResponseDto (what we return for user data):
- id, email, firstName, lastName, isEmailVerified, isActive, createdAt
- NEVER include: password, tokens, deletedAt

FRONTEND REQUIREMENTS:

Login Page (/login):
- Email + Password fields
- Show/hide password toggle
- "Remember me" checkbox (extends session)
- "Forgot password?" link
- Error messages inline (not just toast)
- Redirects to /dashboard on success
- Redirects to /dashboard if already logged in

Register Page (/register):
- First name, Last name, Email, Password, Confirm Password fields
- Real-time password strength indicator
- Terms acceptance checkbox
- Success state: "Check your email" message

Forgot Password Page (/forgot-password):
- Email field
- Success state after submit

Reset Password Page (/reset-password?token=xxx):
- New password + confirm fields
- Reads token from URL query param
- Redirects to /login on success

Auth Context (Global State):
- Stores: user object, accessToken, isAuthenticated, isLoading
- Persists tokens in memory (accessToken) and httpOnly cookie simulation (refreshToken in localStorage for SPA)
- Auto-refreshes access token when it expires (via Axios interceptor)
- Exposes: login(), logout(), refreshUser() functions

Protected Route Component:
- Wraps routes that require authentication
- Redirects to /login with returnUrl if not authenticated
- Shows loading spinner while checking auth status
```

### أمر الـ Plan:

```
/speckit.plan Use the existing tech stack from Sprint 1. Additional packages needed:
- Backend: passport, @nestjs/passport, passport-jwt, @nestjs/jwt, bcrypt, @types/bcrypt, crypto (built-in)
- Email: nodemailer + @types/nodemailer (for real emails later, mock for now)
- Frontend: js-cookie for refresh token storage, jwt-decode for token parsing
```

### أوامر Tasks و Implement:

```
/speckit.tasks
```

```
/speckit.implement
```

### ✅ Acceptance Criteria للـ Spec 2:
- [ ] Register → Login → Logout flow يشتغل end-to-end
- [ ] Access token ينتهي بعد 15 دقيقة
- [ ] Refresh token rotation شغال (كل refresh بيعمل token جديد)
- [ ] Password reset flow شغال (token في الـ logs)
- [ ] Protected routes بتـ redirect للـ login
- [ ] Unit tests للـ AuthService بتعدي

---

## 📝 SPEC 3: Users & Role-Based Access Control

### الـ Prompt للـ `/speckit.specify`:

```
/speckit.specify Build a complete Users management system with Role-Based Access Control (RBAC) for the NestJS Scaffolding Dashboard.

WHAT WE'RE BUILDING:
A flexible permission system where admins can manage users, create custom roles, and assign granular permissions. This enables the scaffolding dashboard to support any multi-tenant or multi-role application out of the box.

BACKEND REQUIREMENTS:

New Prisma Entities:

Role:
- id: UUID
- name: String (unique, e.g., "admin", "user", "moderator")
- description: String?
- permissions: Permission[] (many-to-many)
- users: User[] (many-to-many)
- isSystem: Boolean (system roles can't be deleted, e.g., "admin", "user")
- createdAt, updatedAt

Permission:
- id: UUID
- resource: String (e.g., "users", "roles", "files")
- action: String (e.g., "create", "read", "update", "delete")
- name: String (computed: "resource:action", e.g., "users:read")
- description: String?
- roles: Role[] (many-to-many)

Update User entity: add roles: Role[] (many-to-many)

Database Seeding:
Seed script that creates:
- Permissions: users:create, users:read, users:update, users:delete, roles:create, roles:read, roles:update, roles:delete, files:upload, files:read, files:delete
- Role "admin": has ALL permissions, isSystem: true
- Role "user": has only users:read (their own profile), files:upload, files:read, isSystem: true
- Default admin user: admin@example.com / Admin123! with "admin" role

RBAC Decorators & Guards:
- @Public() decorator: marks endpoint as public (skips JWT guard)
- @Roles('admin', 'moderator') decorator: requires user to have one of these roles
- @Permissions('users:create', 'roles:read') decorator: requires user to have ALL these permissions
- RolesGuard: checks if user's roles include any required role
- PermissionsGuard: checks if user's permissions include all required permissions
- Guards applied in order: JwtAuthGuard → RolesGuard → PermissionsGuard

Users CRUD Endpoints (all require authentication):

GET /api/v1/users — Permission: users:read
- Query params: page, limit, sort, order, search (searches name + email), isActive, role
- Returns paginated list of users with their roles

POST /api/v1/users — Permission: users:create
- Body: { email, password, firstName, lastName, roleIds[] }
- Creates user + assigns roles
- Sends welcome email (mock)

GET /api/v1/users/:id — Permission: users:read
- Returns user with roles and permissions

PATCH /api/v1/users/:id — Permission: users:update
- Body: partial { firstName, lastName, isActive }
- Cannot change email or password through this endpoint

DELETE /api/v1/users/:id — Permission: users:delete
- Soft delete (sets deletedAt)
- Cannot delete yourself
- Cannot delete system admin account

GET /api/v1/users/me — Authenticated (any role)
- Returns current user with roles and permissions

PATCH /api/v1/users/me — Authenticated (any role)
- Body: { firstName, lastName }
- Cannot change email or password here

POST /api/v1/users/me/change-password — Authenticated (any role)
- Body: { currentPassword, newPassword }

Roles CRUD Endpoints:

GET /api/v1/roles — Permission: roles:read
POST /api/v1/roles — Permission: roles:create
GET /api/v1/roles/:id — Permission: roles:read
PATCH /api/v1/roles/:id — Permission: roles:update (cannot edit system roles)
DELETE /api/v1/roles/:id — Permission: roles:delete (cannot delete system roles)
POST /api/v1/roles/:id/permissions — Permission: roles:update (assign permissions to role)
DELETE /api/v1/roles/:id/permissions/:permId — Permission: roles:update
POST /api/v1/users/:id/roles — Permission: users:update (assign roles to user)
DELETE /api/v1/users/:id/roles/:roleId — Permission: users:update

Pagination Helper:
Generic pagination utility that accepts: page, limit, sort, order, where conditions
Returns: { data[], meta: { page, limit, total, totalPages, hasNext, hasPrev } }

FRONTEND REQUIREMENTS:

Users Management Page (/dashboard/users):
- Data table with columns: Avatar, Name, Email, Roles (badges), Status (active/inactive badge), Created At, Actions
- Search bar (debounced 300ms)
- Filter by role dropdown
- Filter by status (active/inactive)
- Pagination controls
- "Add User" button → opens Create User modal
- Row actions: Edit (pencil icon), Delete (trash icon with confirmation dialog)

Create/Edit User Modal:
- Fields: First Name, Last Name, Email (disabled in edit), Password (only in create), Role selector (multi-select)
- Client-side validation matching backend rules
- Shows API errors inline on relevant fields

Roles Management Page (/dashboard/roles):
- Table with: Role Name, Description, Permissions count, Users count, System badge, Actions
- "Add Role" button → opens Create Role modal
- Cannot edit/delete system roles (buttons disabled with tooltip)
- Role detail modal: shows all permissions as checkboxes grouped by resource

Profile Page (/dashboard/profile):
- Display current user info
- Edit form for name
- Change password section (current + new + confirm)

Navigation:
- Sidebar links: Dashboard, Users (requires users:read), Roles (requires roles:read), Profile
- Links hidden if user lacks the required permission
```

### أمر الـ Plan:

```
/speckit.plan Same tech stack. No new backend packages needed. Frontend: add @tanstack/react-query for server state management, react-hook-form + zod for form validation.
```

### أوامر Tasks و Implement:

```
/speckit.tasks
```

```
/speckit.implement
```

### ✅ Acceptance Criteria للـ Spec 3:
- [ ] Seed script يشتغل: `npx prisma db seed`
- [ ] Admin user يقدر يعمل CRUD على users
- [ ] Regular user مايقدرش يوصل لـ /api/v1/users (403)
- [ ] Users Management Page بتعمل search و filter و pagination
- [ ] Roles Management Page بتمنع edit/delete على system roles
- [ ] Integration tests للـ Users endpoints بتعدي

---

## 📝 SPEC 4: File Upload & Production Utilities

### الـ Prompt للـ `/speckit.specify`:

```
/speckit.specify Build file upload capabilities and production-grade utilities for the NestJS Scaffolding Dashboard.

WHAT WE'RE BUILDING:
A flexible file upload system using the Strategy pattern (local or S3), plus audit logging, caching, and all remaining production utilities that make this boilerplate enterprise-ready.

BACKEND REQUIREMENTS:

File Entity (Prisma):
- id: UUID
- originalName: String (original filename)
- filename: String (stored filename, UUID-based to avoid conflicts)
- mimeType: String
- size: Int (bytes)
- path: String (local path or S3 key)
- url: String (public URL to access the file)
- uploadedBy: UUID (relation to User)
- createdAt, updatedAt, deletedAt

Storage Strategy Pattern:
- IStorageService interface with: upload(file), delete(fileId), getUrl(filename)
- LocalStorageService: saves files to /uploads/ folder, serves via /api/v1/static/:filename
- S3StorageService: uploads to AWS S3 (implementation stubbed but interface complete — activated via STORAGE_PROVIDER=s3 env var)
- StorageModule uses factory pattern to inject correct service based on env var

File Upload Endpoints:

POST /api/v1/files/upload — Permission: files:upload
- Multipart/form-data, field name: "file"
- Validates: max size 10MB (configurable via env), allowed MIME types: image/jpeg, image/png, image/gif, image/webp, application/pdf, text/plain (configurable)
- Returns: FileResponseDto { id, originalName, url, mimeType, size, createdAt }

POST /api/v1/files/upload/multiple — Permission: files:upload
- Max 10 files per request
- Same validations as single upload
- Returns: FileResponseDto[]

GET /api/v1/files/:id — Permission: files:read
- Returns file metadata (not the file itself)

DELETE /api/v1/files/:id — Permission: files:delete
- Soft deletes DB record
- Deletes actual file from storage (local or S3)
- Only file owner or admin can delete

AuditLog Entity (Prisma):
- id: UUID
- userId: UUID? (nullable, for system actions)
- userEmail: String? (snapshot of email at time of action)
- action: Enum (CREATE, UPDATE, DELETE, LOGIN, LOGOUT, FAILED_LOGIN)
- resource: String (e.g., "User", "Role", "File")
- resourceId: String? (ID of affected entity)
- oldData: Json? (before state for UPDATE/DELETE)
- newData: Json? (after state for CREATE/UPDATE)
- ipAddress: String?
- userAgent: String?
- createdAt: DateTime

AuditLog Middleware:
- Automatically logs CREATE/UPDATE/DELETE on: User, Role, File entities
- Implemented as a NestJS interceptor that hooks into responses
- Auth events (login, logout, failed login) logged manually in AuthService

Audit Log Endpoint:
GET /api/v1/audit-logs — Permission: admin role only
- Paginated list with filters: userId, action, resource, dateFrom, dateTo
- Cannot modify or delete audit logs

Redis Cache:
- CacheModule configured with Redis
- @Cacheable() decorator for caching method results (TTL configurable)
- Cache invalidation on entity updates
- Example: GET /api/v1/users/:id cached for 60 seconds, invalidated on PATCH

Rate Limiting Refinement:
- Custom limits per endpoint type:
  - Auth endpoints: 10 requests per minute
  - Upload endpoints: 20 requests per minute
  - General endpoints: 100 requests per minute
- Returns proper 429 response with retry-after header

Static File Serving:
- Local uploads served at /api/v1/static/:filename
- Only authenticated users can access files

FRONTEND REQUIREMENTS:

File Upload Component (reusable):
- Drag & drop zone
- Click to browse
- Shows upload progress bar (using Axios onUploadProgress)
- Preview for images (thumbnail)
- File size and type validation client-side before upload
- Error states (file too large, wrong type)
- Success state with file URL

Reusable DataTable Component:
This is THE most important frontend component — used everywhere.
Props: columns[], data[], isLoading, pagination, onPageChange, onSort, onSearch, actions[]
Features:
- Column sorting (click header)
- Global search input (debounced)
- Pagination controls
- Loading skeleton
- Empty state
- Row selection (optional)
- Responsive (horizontal scroll on mobile)

Toast Notification System:
- Success, Error, Warning, Info variants
- Auto-dismiss after 3 seconds
- Maximum 3 toasts visible at once
- Accessible (ARIA)

Confirmation Dialog Component:
- Reusable modal for destructive actions
- Props: title, message, confirmLabel, onConfirm, onCancel
- Confirms with "DELETE" text input for extra-sensitive operations

Skeleton Loading Components:
- TableSkeleton, CardSkeleton, FormSkeleton
- Used everywhere while data loads

Avatar Component:
- Shows user initials if no photo
- Colored background based on name hash
- Sizes: sm, md, lg
```

### أمر الـ Plan:

```
/speckit.plan Same core stack. Additional packages:
- Backend: multer + @types/multer, @aws-sdk/client-s3 (for S3 stub), cache-manager, cache-manager-ioredis, ioredis
- Frontend: react-dropzone for drag & drop upload
```

### أوامر Tasks و Implement:

```
/speckit.tasks
```

```
/speckit.implement
```

### ✅ Acceptance Criteria للـ Spec 4:
- [ ] Upload صورة وتظهر فوراً في الـ preview
- [ ] محاولة upload ملف أكبر من 10MB بترجع error واضح
- [ ] Audit log بيتسجل عند login/logout وعند create/delete user
- [ ] DataTable بيشتغل مع sort + search + pagination
- [ ] Cache بيشتغل: نفس الـ request مرتين — التانية أسرع وما بتوصلش للـ DB

---

## 📝 SPEC 5: CRUD Generator (الميزة الأهم)

### الـ Prompt للـ `/speckit.specify`:

```
/speckit.specify Build the CRUD Generator — the centerpiece feature of the NestJS Scaffolding Dashboard.

WHAT WE'RE BUILDING:
A CLI generator that takes an entity name and field definitions, and generates a complete, production-ready CRUD implementation in seconds — including both backend (NestJS) and frontend (React) code.

COMMAND INTERFACE:

npm run generate -- --name=Product --fields="name:string,price:number,description:string?,stock:number,category:string,isActive:boolean"

Field type syntax:
- fieldName:type → required field
- fieldName:type? → optional field
Supported types: string, number, boolean, date, uuid (foreign key reference)

OUTPUT — BACKEND (auto-placed in src/modules/products/):

1. products.entity.ts (Prisma schema addition):
   - Generates Prisma model with correct field types
   - Auto-adds: id (UUID), createdAt, updatedAt, deletedAt (soft delete)
   - Prints the model to append to schema.prisma manually (or auto-appends with a flag)

2. dto/create-product.dto.ts:
   - class-validator decorators matching field types
   - @IsString(), @IsNumber(), @IsBoolean(), @IsOptional() etc.
   - @ApiProperty() decorators for Swagger

3. dto/update-product.dto.ts:
   - Extends CreateProductDto with PartialType
   - All fields become optional

4. products.service.ts:
   - Constructor injects PrismaService
   - Methods: create(dto), findAll(query: PaginationQueryDto), findOne(id), update(id, dto), remove(id)
   - findAll uses the generic pagination helper
   - All methods include proper error handling (throw NotFoundException if not found)
   - Soft delete in remove()

5. products.controller.ts:
   - @ApiTags('products')
   - @ApiBearerAuth()
   - CRUD endpoints with proper HTTP methods
   - @Permissions() applied: products:create, products:read, products:update, products:delete
   - @ApiResponse() decorators for 200, 201, 400, 401, 403, 404
   - Uses PaginationQueryDto for list endpoint
   - Returns paginated response for list

6. products.module.ts:
   - Imports: PrismaModule
   - Providers: ProductsService
   - Controllers: ProductsController
   - Exports: ProductsService

7. Auto-registration:
   - Generator reads app.module.ts
   - Adds ProductsModule to the imports array automatically using AST manipulation (ts-morph)
   - Does NOT break existing imports

OUTPUT — FRONTEND (auto-placed in src/pages/products/):

8. types/product.types.ts:
   - TypeScript interface matching the entity
   - CreateProductInput and UpdateProductInput types

9. services/products.service.ts (frontend):
   - Axios-based service functions: getProducts(params), getProduct(id), createProduct(data), updateProduct(id, data), deleteProduct(id)
   - Uses the configured Axios instance (with auth interceptors)

10. ProductsPage.tsx (List Page):
    - Uses the reusable DataTable component
    - Columns auto-generated from field definitions
    - Search, sort, pagination wired up
    - "Add Product" button
    - Edit and Delete actions per row

11. ProductFormModal.tsx (Create/Edit Form):
    - react-hook-form + zod validation matching backend rules
    - All fields with correct input types (text, number, checkbox for boolean, date picker for date)
    - Used for both create and edit (title and submit label change)

12. Auto-register route:
    - Adds /dashboard/products route to router
    - Adds "Products" link to sidebar (with appropriate icon)

GENERATOR IMPLEMENTATION:
- Built with Plop.js (npm run generate triggers plop)
- Templates stored in /generators/templates/
- Each template is a Handlebars (.hbs) file
- Generator script: /generators/crud-generator.js
- ts-morph used for AST manipulation (adding module to AppModule, route to router)

VALIDATION:
- Reject if entity name is not PascalCase
- Reject if field types are not in supported list
- Warn if entity name already exists (module folder already present)
- Dry-run flag: --dry-run prints what would be generated without writing files

DEMO COMMAND (to test the generator):
npm run generate -- --name=Product --fields="name:string,price:number,description:string?,stock:number,isActive:boolean"
npm run generate -- --name=Category --fields="name:string,slug:string,parentId:uuid?"
npm run generate -- --name=Order --fields="customerId:uuid,total:number,status:string,notes:string?"

All three should generate without errors and the app should run with all three new modules working.
```

### أمر الـ Plan:

```
/speckit.plan Same core stack. New packages:
- plop (generator framework)
- ts-morph (TypeScript AST manipulation for auto-registration)
- handlebars (template engine — included with plop)
- chalk (terminal colors for generator output)
- commander (CLI argument parsing)
```

### أوامر Tasks و Implement:

```
/speckit.tasks
```

```
/speckit.implement
```

### ✅ Acceptance Criteria للـ Spec 5:
- [ ] `npm run generate -- --name=Product --fields="name:string,price:number"` يشتغل بدون errors
- [ ] الملفات المولودة تتبع نفس نمط الكود المكتوب يدوياً
- [ ] ProductsModule يتضاف تلقائياً لـ `app.module.ts` بدون كسر الـ imports الموجودة
- [ ] Products page تظهر في الـ sidebar وتشتغل (list + create + edit + delete)
- [ ] توليد 3 entities مختلفة (Product, Category, Order) وكلها شغالة في نفس الوقت
- [ ] `--dry-run` بيطبع الملفات من غير ما يكتبها

---

## 📝 SPEC 6: Testing & Production Polish

### الـ Prompt للـ `/speckit.specify`:

```
/speckit.specify Add comprehensive testing coverage and production polish to the NestJS Scaffolding Dashboard.

WHAT WE'RE BUILDING:
Complete test suite covering all critical paths, plus all remaining production-readiness items: documentation, CI/CD, developer experience improvements.

TESTING REQUIREMENTS:

Unit Tests (Jest) — for every Service:

AuthService tests:
- register: success case, duplicate email throws ConflictException, weak password throws BadRequestException
- login: success, wrong password throws UnauthorizedException, inactive user throws ForbiddenException
- refresh: valid token rotates, expired token throws UnauthorizedException, revoked token throws UnauthorizedException
- logout: valid refresh token revoked successfully
- forgotPassword: always returns 200 regardless of email existence
- resetPassword: valid token resets password + revokes all refresh tokens

UsersService tests:
- findAll: returns paginated results, search filter works, role filter works
- findOne: returns user, throws NotFoundException for non-existent ID
- create: success, duplicate email throws ConflictException
- update: success, throws NotFoundException
- remove: success (soft delete), throws when trying to delete self

RolesService tests:
- Full CRUD test coverage
- Cannot delete system role throws ForbiddenException

FilesService tests:
- upload: success, file too large throws exception, wrong MIME type throws exception
- delete: success, not owner throws ForbiddenException (unless admin)

Integration Tests (@nestjs/testing) — for every Controller:
- Uses in-memory test database (SQLite via Prisma)
- Tests the full request → response cycle
- Tests auth guards (unauthorized requests get 401)
- Tests permission guards (wrong permissions get 403)
- Tests validation (invalid body gets 400 with error details)

Coverage targets:
- AuthController: 100% (all 7 endpoints)
- UsersController: 100% (all 9 endpoints)
- RolesController: 100% (all 8 endpoints)
- FilesController: 80% (upload + delete)

E2E Tests (Supertest):
Complete user journeys:

Journey 1 — Full Auth Flow:
register → verify email → login → refresh token → logout → login with expired token (401) → forgot password → reset password → login with new password

Journey 2 — Admin User Management:
login as admin → create user → assign role → get user list (user appears) → update user → soft delete user → get user (404)

Journey 3 — CRUD Generator Output:
generate Product entity → run migration → create product via API → get product list → update product → delete product

CI/CD (GitHub Actions):

.github/workflows/ci.yml:
Triggers: pull_request to main, push to main
Jobs:
1. lint: ESLint + Prettier check
2. type-check: tsc --noEmit
3. test: run all unit + integration tests
4. coverage: upload coverage report to Codecov
5. e2e: run E2E tests against test database
6. build: verify production build succeeds

.github/workflows/release.yml:
Trigger: push tag v*.*.* 
Jobs: build Docker image, push to GitHub Container Registry, create GitHub Release with CHANGELOG

DOCUMENTATION:

README.md (comprehensive):
Sections:
1. Project Overview with feature list
2. Quick Start (3 commands to get running)
3. CRUD Generator documentation with examples
4. API Documentation link
5. Project Structure explanation
6. Environment Variables reference
7. Contributing Guide
8. Tech Stack with version table
9. Roadmap

Include:
- Screenshots of the dashboard, users page, dark mode
- Animated GIF showing the CRUD generator in action (record terminal + browser side by side)
- Badges: CI status, Coverage, License, npm version (if published)

CONTRIBUTING.md:
- How to set up local dev environment
- Branch naming convention: feature/xxx, fix/xxx, docs/xxx
- PR template
- Commit message format (Conventional Commits)

CHANGELOG.md:
- v0.1.0 through v1.0.0 entries
- Following Keep a Changelog format

Postman Collection:
- All endpoints with example requests and responses
- Environment variables for base URL and tokens
- Pre-request script to auto-refresh token if expired
- Exported as JSON in /docs/postman/

DEVELOPER EXPERIENCE:

npm scripts to add to root package.json:
- npm run dev: start backend + frontend in parallel (concurrently)
- npm run generate: CRUD generator
- npm run db:migrate: run Prisma migrations
- npm run db:seed: run seed script
- npm run db:studio: open Prisma Studio
- npm run test: run all tests
- npm run test:coverage: run tests with coverage
- npm run test:e2e: run E2E tests
- npm run lint: lint all code
- npm run build: build backend + frontend

.env.example (complete):
Every variable documented with: description, type, example value, required/optional, default value
```

### أمر الـ Plan:

```
/speckit.plan Same stack. New packages:
- Backend: supertest + @types/supertest for E2E, @prisma/client with SQLite for test database
- Frontend: vitest + @testing-library/react for component tests
- Dev tools: concurrently (run multiple npm scripts), cross-env (cross-platform env vars)
- CI: GitHub Actions with codecov/codecov-action
```

### أوامر Tasks و Implement:

```
/speckit.tasks
```

```
/speckit.implement
```

### ✅ Acceptance Criteria للـ Spec 6:
- [ ] `npm run test:coverage` بيطلع coverage > 70%
- [ ] E2E tests للـ Auth flow كاملة بتعدي
- [ ] GitHub Actions pipeline بتعدي على كل pull request
- [ ] README.md فيها GIF للـ generator
- [ ] Postman Collection شغالة على الـ API
- [ ] `npm run dev` بيشغل backend + frontend بأمر واحد

---

## 🗂️ هيكل الـ Specs في المشروع بعد الانتهاء

```
nestjs-scaffolding-dashboard/
└── .specify/
    ├── memory/
    │   └── constitution.md                    ← المبادئ العامة
    └── specs/
        ├── 001-project-foundation/
        │   ├── spec.md
        │   ├── plan.md
        │   ├── tasks.md
        │   └── data-model.md
        ├── 002-authentication-system/
        │   ├── spec.md
        │   ├── plan.md
        │   └── tasks.md
        ├── 003-users-and-rbac/
        │   ├── spec.md
        │   ├── plan.md
        │   └── tasks.md
        ├── 004-file-upload-utilities/
        │   ├── spec.md
        │   ├── plan.md
        │   └── tasks.md
        ├── 005-crud-generator/
        │   ├── spec.md
        │   ├── plan.md
        │   └── tasks.md
        └── 006-testing-and-polish/
            ├── spec.md
            ├── plan.md
            └── tasks.md
```

---

## ⏱️ الجدول الزمني مع Spec Kit

| الأسبوع | الـ Spec | المرحلة | الأوقات المتوقعة |
|---------|---------|---------|----------------|
| 1 | Foundation | Constitution + Specify + Plan + Implement | 8-10 ساعات |
| 2 | Auth | Specify + Plan + Implement | 8-10 ساعات |
| 3 | Users & RBAC | Specify + Plan + Implement | 8-10 ساعات |
| 4 | File Upload | Specify + Plan + Implement | 6-8 ساعات |
| 5-6 | CRUD Generator | Specify + Plan + Implement | 10-14 ساعات |
| 7-8 | Testing & Polish | Specify + Plan + Implement | 8-10 ساعات |

> **مع Spec Kit:** الوقت الفعلي للكتابة بيتقلل ~40-60% لأن الـ AI بينفذ على أساس specs محددة بدل vibe coding.

---

## 🔄 الـ Workflow اليومي مع Spec Kit

```bash
# 1. افتح Claude Code في مجلد المشروع
cd nestjs-scaffolding-dashboard
claude

# 2. لو بتبدأ spec جديدة
/speckit.specify [الـ prompt الخاص بالـ spec]

# 3. clarify أي حاجة مش واضحة
/speckit.clarify

# 4. حدد الـ tech stack
/speckit.plan [tech details]

# 5. ولد الـ tasks
/speckit.tasks

# 6. نفذ
/speckit.implement

# 7. لو وقفت في نص implementation، ساعد Claude
"Continue implementing from task X, you were working on Y"
```

---

## 🚨 نصائح مهمة لاستخدام Spec Kit

**1. لا تبدأ بـ /speckit.implement مباشرة**
خد وقتك في الـ specify و plan — الوقت اللي بتصرفه هناك بيوفر 3x في الـ implement.

**2. الـ Clarify خطوة مش اختيارية**
دايماً اعمل `/speckit.clarify` قبل الـ plan — بيكشف ambiguities قبل ما تبقى مشاكل في الكود.

**3. راجع الـ plan قبل الـ implement**
افتح `plan.md` وتأكد إن الـ AI فهم المطلوب صح — خصوصاً في الـ CRUD Generator spec.

**4. لو الـ implement وقف أو غلط**
```
The implementation got stuck on [X]. Please continue from [specific task in tasks.md].
The issue was: [describe the problem]
```

**5. احفظ الـ context بين sessions**
الـ constitution و specs محفوظة في ملفات — لو فتحت Claude Code session جديدة، قوله:
```
Please read .specify/memory/constitution.md and .specify/specs/00X-xxx/spec.md before continuing
```

**6. استخدم branches للـ specs**
Spec Kit بيعمل branch تلقائياً لكل spec — خليها كده وعمل PR لكل sprint.

---

## 📊 Milestones التحقق السريع

```
v0.1.0 ← بعد Spec 1: docker-compose up + /api/v1/health شغالين
v0.2.0 ← بعد Spec 2: login + logout + protected routes شغالين
v0.3.0 ← بعد Spec 3: Users management + RBAC شغالين
v0.4.0 ← بعد Spec 4: File upload + Audit log شغالين
v1.0.0 ← بعد Spec 5: CRUD Generator شغال ✨ (ده الـ milestone الأهم)
v1.0.0-stable ← بعد Spec 6: Tests + Docs + GitHub Release
```
# 📝 SPEC 7: Advanced Dynamic Settings System (Schema-Based)

> أضفه للخطة الأساسية كـ Spec جديدة بعد Spec 6.
> **المنهجية:** Schema-as-Source-of-Truth — الـ TypeScript schema هي المرجع، الـ DB يحفظ القيم فقط.

---

## الـ Prompt للـ `/speckit.specify`:

```
/speckit.specify Build a production-grade Schema-Based Dynamic Settings System for the NestJS Scaffolding Dashboard.

---

## CORE PHILOSOPHY

The settings system follows a "Schema-as-Source-of-Truth" pattern inspired by Terraform and Kubernetes:

- **Schema files** (TypeScript) → define STRUCTURE (keys, types, labels, validations)
- **Database** → stores VALUES only (what the admin configured)
- **Sync Engine** → runs on every app startup, reconciles schema vs DB safely
- **Redis** → caches values for fast runtime access

The golden rule:
  Schema controls STRUCTURE.
  Database controls VALUES.
  The sync engine NEVER touches existing values.

---

## FOLDER STRUCTURE

src/modules/settings/
├── schema/
│   ├── groups/
│   │   ├── general.schema.ts
│   │   ├── email.schema.ts
│   │   ├── security.schema.ts
│   │   ├── storage.schema.ts
│   │   └── notifications.schema.ts
│   └── index.ts                        ← exports ALL_SETTING_GROUPS array
├── settings.schema.ts                  ← defineSettingGroup() helper + types
├── settings-sync.service.ts            ← startup sync engine
├── settings.service.ts                 ← runtime get/set with cache
├── settings.controller.ts
├── settings.module.ts
└── dto/
    ├── update-group.dto.ts
    ├── create-group.dto.ts
    └── create-setting.dto.ts

src/modules/user-preferences/
├── schema/
│   ├── groups/
│   │   ├── appearance.schema.ts
│   │   ├── notifications.schema.ts
│   │   └── dashboard.schema.ts
│   └── index.ts
├── user-preferences.schema.ts
├── user-preferences-sync.service.ts
├── user-preferences.service.ts
├── user-preferences.controller.ts
└── user-preferences.module.ts

---

## THE SCHEMA DEFINITION SYSTEM

### Core Types (settings.schema.ts)

```typescript
export type SettingType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'JSON' | 'SECRET';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SettingValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
}

export interface SettingDefinition<T extends SettingType = SettingType> {
  type: T;
  label: string;
  description?: string;
  defaultValue: T extends 'BOOLEAN' ? boolean
               : T extends 'NUMBER' ? number
               : T extends 'JSON' ? object
               : string;
  options?: T extends 'SELECT' ? SelectOption[] : never;
  validation?: SettingValidation;
  isReadOnly?: boolean;
  isPublic?: boolean;   // non-admins can READ this value
  order: number;
}

export interface SettingGroupSchema<T extends Record<string, SettingDefinition>> {
  key: string;
  label: string;
  description?: string;
  icon?: string;         // lucide-react icon name
  order: number;
  isPublic?: boolean;    // entire group readable by non-admins
  settings: T;
}

// The helper function with full TypeScript inference
export function defineSettingGroup<T extends Record<string, SettingDefinition>>(
  schema: SettingGroupSchema<T>
): SettingGroupSchema<T> & {
  keys: { [K in keyof T]: `${string}.${string & K}` }
} {
  const keys = Object.fromEntries(
    Object.keys(schema.settings).map(k => [k, `${schema.key}.${k}`])
  ) as any;
  return { ...schema, keys };
}
```

---

## THE SCHEMA FILES

### general.schema.ts
```typescript
import { defineSettingGroup } from '../settings.schema';

export const GeneralSettings = defineSettingGroup({
  key: 'general',
  label: 'General Settings',
  icon: 'Settings',
  order: 1,
  isPublic: true,
  settings: {
    app_name: {
      type: 'STRING',
      label: 'Application Name',
      description: 'Displayed in the browser tab and emails',
      defaultValue: 'My App',
      validation: { required: true, min: 2, max: 100 },
      order: 1,
    },
    app_url: {
      type: 'STRING',
      label: 'Application URL',
      description: 'Base URL used in emails and links',
      defaultValue: 'http://localhost:3000',
      validation: { required: true, pattern: '^https?://' },
      order: 2,
    },
    app_logo_url: {
      type: 'STRING',
      label: 'Logo URL',
      description: 'URL to your application logo image',
      defaultValue: '',
      order: 3,
    },
    maintenance_mode: {
      type: 'BOOLEAN',
      label: 'Maintenance Mode',
      description: 'When enabled, only admins can access the application',
      defaultValue: false,
      order: 4,
    },
    maintenance_message: {
      type: 'STRING',
      label: 'Maintenance Message',
      description: 'Message shown to users during maintenance',
      defaultValue: 'We are currently down for maintenance. Please try again later.',
      order: 5,
    },
  },
});
```

### email.schema.ts
```typescript
export const EmailSettings = defineSettingGroup({
  key: 'email_settings',
  label: 'Email Configuration',
  icon: 'Mail',
  order: 2,
  settings: {
    smtp_host: {
      type: 'STRING',
      label: 'SMTP Host',
      defaultValue: 'smtp.gmail.com',
      validation: { required: true },
      order: 1,
    },
    smtp_port: {
      type: 'NUMBER',
      label: 'SMTP Port',
      defaultValue: 587,
      validation: { required: true, min: 1, max: 65535 },
      order: 2,
    },
    smtp_user: {
      type: 'STRING',
      label: 'SMTP Username',
      defaultValue: '',
      order: 3,
    },
    smtp_password: {
      type: 'SECRET',
      label: 'SMTP Password',
      defaultValue: '',
      order: 4,
    },
    smtp_from_name: {
      type: 'STRING',
      label: 'From Name',
      defaultValue: 'My App',
      order: 5,
    },
    smtp_from_email: {
      type: 'STRING',
      label: 'From Email',
      defaultValue: 'noreply@myapp.com',
      validation: { pattern: '^[^@]+@[^@]+\.[^@]+$' },
      order: 6,
    },
    smtp_secure: {
      type: 'BOOLEAN',
      label: 'Use TLS/SSL',
      defaultValue: false,
      order: 7,
    },
  },
});
```

### security.schema.ts
```typescript
export const SecuritySettings = defineSettingGroup({
  key: 'security_settings',
  label: 'Security',
  icon: 'Shield',
  order: 3,
  settings: {
    access_token_ttl: {
      type: 'NUMBER',
      label: 'Access Token Lifetime',
      description: 'In seconds. Default: 900 (15 minutes)',
      defaultValue: 900,
      validation: { required: true, min: 60, max: 86400 },
      order: 1,
    },
    refresh_token_ttl: {
      type: 'NUMBER',
      label: 'Refresh Token Lifetime',
      description: 'In seconds. Default: 604800 (7 days)',
      defaultValue: 604800,
      validation: { required: true, min: 3600 },
      order: 2,
    },
    max_login_attempts: {
      type: 'NUMBER',
      label: 'Max Failed Login Attempts',
      description: 'Before account is temporarily locked',
      defaultValue: 5,
      validation: { min: 1, max: 20 },
      order: 3,
    },
    lockout_duration: {
      type: 'NUMBER',
      label: 'Lockout Duration',
      description: 'In seconds. Default: 900 (15 minutes)',
      defaultValue: 900,
      order: 4,
    },
    require_email_verification: {
      type: 'BOOLEAN',
      label: 'Require Email Verification',
      defaultValue: true,
      order: 5,
    },
    allowed_origins: {
      type: 'JSON',
      label: 'Allowed CORS Origins',
      description: 'Array of allowed origins. Example: ["https://myapp.com"]',
      defaultValue: [],
      order: 6,
    },
    password_min_length: {
      type: 'NUMBER',
      label: 'Minimum Password Length',
      defaultValue: 8,
      validation: { min: 6, max: 128 },
      order: 7,
    },
  },
});
```

### storage.schema.ts
```typescript
export const StorageSettings = defineSettingGroup({
  key: 'storage_settings',
  label: 'File Storage',
  icon: 'HardDrive',
  order: 4,
  settings: {
    storage_provider: {
      type: 'SELECT',
      label: 'Storage Provider',
      defaultValue: 'local',
      options: [
        { label: 'Local Disk', value: 'local' },
        { label: 'Amazon S3', value: 's3' },
        { label: 'Cloudflare R2', value: 'r2' },
      ],
      order: 1,
    },
    max_file_size_mb: {
      type: 'NUMBER',
      label: 'Max File Size (MB)',
      defaultValue: 10,
      validation: { min: 1, max: 500 },
      order: 2,
    },
    allowed_mime_types: {
      type: 'JSON',
      label: 'Allowed File Types',
      description: 'Array of allowed MIME types',
      defaultValue: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
      order: 3,
    },
    s3_bucket: {
      type: 'STRING',
      label: 'S3 Bucket Name',
      defaultValue: '',
      order: 4,
    },
    s3_region: {
      type: 'SELECT',
      label: 'S3 Region',
      defaultValue: 'us-east-1',
      options: [
        { label: 'US East (N. Virginia)', value: 'us-east-1' },
        { label: 'EU (Frankfurt)', value: 'eu-central-1' },
        { label: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' },
      ],
      order: 5,
    },
    s3_access_key: {
      type: 'SECRET',
      label: 'S3 Access Key ID',
      defaultValue: '',
      order: 6,
    },
    s3_secret_key: {
      type: 'SECRET',
      label: 'S3 Secret Access Key',
      defaultValue: '',
      order: 7,
    },
  },
});
```

### schema/index.ts
```typescript
import { GeneralSettings }       from './groups/general.schema';
import { EmailSettings }         from './groups/email.schema';
import { SecuritySettings }      from './groups/security.schema';
import { StorageSettings }       from './groups/storage.schema';
import { NotificationSettings }  from './groups/notifications.schema';

// Add new groups here — sync engine picks them up automatically on next startup
export const ALL_SETTING_GROUPS = [
  GeneralSettings,
  EmailSettings,
  SecuritySettings,
  StorageSettings,
  NotificationSettings,
];

// Re-export for type-safe usage in services
export { GeneralSettings, EmailSettings, SecuritySettings, StorageSettings, NotificationSettings };
```

---

## THE SYNC ENGINE (settings-sync.service.ts)

Runs once on app startup via OnModuleInit. Safe to run on every deploy.

```typescript
@Injectable()
export class SettingsSyncService implements OnModuleInit {
  constructor(private prisma: PrismaService, private logger: Logger) {}

  async onModuleInit() {
    this.logger.log('Running settings sync...');
    await this.syncAllGroups();
    this.logger.log('Settings sync complete.');
  }

  async syncAllGroups() {
    for (const groupSchema of ALL_SETTING_GROUPS) {
      await this.syncGroup(groupSchema);
    }
    await this.deprecateRemovedSettings();
  }

  async syncGroup(schema: SettingGroupSchema<any>) {
    // UPSERT the group (create if not exists, update label/icon/order if changed)
    const group = await this.prisma.settingGroup.upsert({
      where: { key: schema.key },
      create: {
        key: schema.key,
        label: schema.label,
        description: schema.description,
        icon: schema.icon,
        order: schema.order,
        isPublic: schema.isPublic ?? false,
      },
      update: {
        label: schema.label,       // OK to update display metadata
        description: schema.description,
        icon: schema.icon,
        order: schema.order,
        isPublic: schema.isPublic ?? false,
        // NEVER update: values, custom settings added via API
      },
    });

    // For each setting in schema:
    for (const [key, def] of Object.entries(schema.settings)) {
      const existing = await this.prisma.setting.findUnique({
        where: { groupId_key: { groupId: group.id, key } },
      });

      if (!existing) {
        // NEW setting → INSERT with defaultValue, don't touch if exists
        await this.prisma.setting.create({
          data: {
            groupId: group.id,
            key,
            fullKey: `${schema.key}.${key}`,
            label: def.label,
            description: def.description,
            type: def.type,
            value: this.serializeDefault(def.defaultValue),
            defaultValue: this.serializeDefault(def.defaultValue),
            options: def.options ?? null,
            validation: def.validation ?? null,
            isReadOnly: def.isReadOnly ?? false,
            isPublic: def.isPublic ?? false,
            order: def.order,
            isDeprecated: false,
          },
        });
        this.logger.log(`[Settings] Created: ${schema.key}.${key}`);
      } else {
        // EXISTING setting → update ONLY metadata, NEVER the value
        if (existing.type !== def.type) {
          // Type change is dangerous — warn but don't auto-migrate
          this.logger.warn(
            `[Settings] Type mismatch for ${schema.key}.${key}: ` +
            `DB has "${existing.type}", schema says "${def.type}". ` +
            `Manual migration required.`
          );
        }
        await this.prisma.setting.update({
          where: { id: existing.id },
          data: {
            label: def.label,           // update display metadata only
            description: def.description,
            options: def.options ?? null,
            validation: def.validation ?? null,
            isReadOnly: def.isReadOnly ?? false,
            order: def.order,
            isDeprecated: false,        // un-deprecate if re-added to schema
            // value: NEVER TOUCHED ← sacred
          },
        });
      }
    }
  }

  async deprecateRemovedSettings() {
    // Find settings in DB that are no longer in any schema
    const allSchemaKeys = ALL_SETTING_GROUPS.flatMap(g =>
      Object.keys(g.settings).map(k => `${g.key}.${k}`)
    );

    await this.prisma.setting.updateMany({
      where: {
        fullKey: { notIn: allSchemaKeys },
        isDeprecated: false,
        isCustom: false,   // don't touch settings created via API (isCustom: true)
      },
      data: { isDeprecated: true },
    });
  }

  private serializeDefault(value: any): string {
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}
```

---

## PRISMA SCHEMA ADDITIONS

```prisma
model SettingGroup {
  id          String    @id @default(uuid())
  key         String    @unique
  label       String
  description String?
  icon        String?
  order       Int       @default(0)
  isPublic    Boolean   @default(false)
  settings    Setting[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Setting {
  id           String        @id @default(uuid())
  groupId      String
  group        SettingGroup  @relation(fields: [groupId], references: [id])
  key          String
  fullKey      String        @unique
  label        String
  description  String?
  type         SettingType
  value        String
  defaultValue String?
  options      Json?
  validation   Json?
  isRequired   Boolean       @default(false)
  isReadOnly   Boolean       @default(false)
  isPublic     Boolean       @default(false)
  isDeprecated Boolean       @default(false)
  isCustom     Boolean       @default(false)  // true = created via API, not from schema
  order        Int           @default(0)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@unique([groupId, key])
}

enum SettingType {
  STRING
  NUMBER
  BOOLEAN
  SELECT
  JSON
  SECRET
}

model UserPreferenceGroup {
  id          String            @id @default(uuid())
  key         String            @unique
  label       String
  description String?
  icon        String?
  order       Int               @default(0)
  preferences UserPreference[]
}

model UserPreference {
  id           String                @id @default(uuid())
  groupId      String
  group        UserPreferenceGroup   @relation(fields: [groupId], references: [id])
  key          String
  fullKey      String                @unique
  label        String
  description  String?
  type         SettingType
  defaultValue String?
  options      Json?
  order        Int                   @default(0)
  values       UserPreferenceValue[]

  @@unique([groupId, key])
}

model UserPreferenceValue {
  id           String         @id @default(uuid())
  userId       String
  user         User           @relation(fields: [userId], references: [id])
  preferenceId String
  preference   UserPreference @relation(fields: [preferenceId], references: [id])
  value        String
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  @@unique([userId, preferenceId])
}
```

---

## SETTINGS SERVICE (runtime)

```typescript
@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private encryption: EncryptionService,
  ) {}

  // Type-safe get using schema keys
  async get(fullKey: string): Promise<string | null> {
    const cacheKey = `settings:${fullKey}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const setting = await this.prisma.setting.findUnique({ where: { fullKey } });
    if (!setting) return null;

    let value = setting.value ?? setting.defaultValue ?? null;
    if (setting.type === 'SECRET' && value?.startsWith('enc:')) {
      value = this.encryption.decrypt(value.slice(4));
    }

    await this.redis.set(cacheKey, value, 300); // 5 min TTL
    return value;
  }

  async getTyped<T>(fullKey: string): Promise<T> {
    const raw = await this.get(fullKey);
    return this.parse<T>(raw, fullKey);
  }

  async getGroup(groupKey: string): Promise<Record<string, any>> {
    const group = await this.prisma.settingGroup.findUnique({
      where: { key: groupKey },
      include: { settings: true },
    });
    if (!group) throw new NotFoundException(`Setting group "${groupKey}" not found`);

    const result: Record<string, any> = {};
    for (const setting of group.settings) {
      result[setting.key] = await this.parseByType(setting);
    }
    return result;
  }

  async set(fullKey: string, value: any): Promise<void> {
    const setting = await this.prisma.setting.findUnique({ where: { fullKey } });
    if (!setting) throw new NotFoundException(`Setting "${fullKey}" not found`);
    if (setting.isReadOnly) throw new ForbiddenException(`Setting "${fullKey}" is read-only`);

    let serialized = this.serialize(value);
    if (setting.type === 'SECRET') {
      serialized = 'enc:' + this.encryption.encrypt(serialized);
    }

    await this.prisma.setting.update({
      where: { fullKey },
      data: { value: serialized },
    });
    await this.redis.del(`settings:${fullKey}`);  // invalidate cache
  }

  async setGroup(groupKey: string, values: Record<string, any>): Promise<void> {
    for (const [key, value] of Object.entries(values)) {
      await this.set(`${groupKey}.${key}`, value);
    }
    // Also clear the group-level cache if any
    await this.redis.del(`settings:group:${groupKey}`);
  }

  private parse<T>(raw: string | null, fullKey: string): T {
    // parse based on DB type for this fullKey
    // implementation details...
  }
}
```

---

## TYPE-SAFE USAGE IN ANY SERVICE

```typescript
// ✅ Type-safe — TypeScript error if key is wrong
import { EmailSettings, SecuritySettings, GeneralSettings } from '../settings/schema';

@Injectable()
export class EmailService {
  constructor(private settings: SettingsService) {}

  async sendEmail() {
    const host     = await this.settings.get(EmailSettings.keys.smtp_host);
    const port     = await this.settings.getTyped<number>(EmailSettings.keys.smtp_port);
    const secure   = await this.settings.getTyped<boolean>(EmailSettings.keys.smtp_secure);
    const password = await this.settings.get(EmailSettings.keys.smtp_password); // auto-decrypted
    // ...
  }
}

@Injectable()
export class AuthService {
  async login() {
    const ttl = await this.settings.getTyped<number>(SecuritySettings.keys.access_token_ttl);
    const maxAttempts = await this.settings.getTyped<number>(SecuritySettings.keys.max_login_attempts);
    // ...
  }
}
```

---

## BACKEND ENDPOINTS

GET /api/v1/settings
- Returns all non-deprecated groups + settings
- Admins: all groups
- Authenticated non-admins: only isPublic groups
- SECRET values: returned as "••••••••" by default

GET /api/v1/settings/:groupKey
- Single group with all its settings

PATCH /api/v1/settings/:groupKey — Permission: settings:update
- Body: { key: value, key2: value2 }
- Validates each value against type + validation rules
- SECRET values encrypted before storage
- Invalidates Redis cache
- Returns updated group

GET /api/v1/settings/:groupKey/:settingKey/reveal — Permission: settings:reveal
- Returns the actual decrypted value of a SECRET field
- Logged in AuditLog

POST /api/v1/settings/groups — Permission: settings:manage
- Creates a custom group (isCustom: true)

POST /api/v1/settings/groups/:groupKey/settings — Permission: settings:manage
- Adds a custom setting to any group (isCustom: true)

GET /api/v1/settings/sync-status
- Returns list of deprecated settings + any schema warnings
- Useful for monitoring

---

## FRONTEND — Settings Page

Route: /dashboard/settings
Permission: settings:read

Layout:
- Left sidebar: setting groups loaded from API (dynamic, not hardcoded)
  - Icon + Label per group
  - "Deprecated" badge on deprecated groups
- Right panel: dynamic form for selected group

Dynamic Form Renderer (SettingsForm.tsx):
Renders fields based on `type` from API — zero hardcoding:

STRING  → <Input type="text" /> + character count if max defined
NUMBER  → <Input type="number" min={} max={} />
BOOLEAN → <Switch /> with label
SELECT  → <Select> with options from API
JSON    → <Textarea /> + JSON validator + pretty-print button + error highlight
SECRET  → <Input type="password" /> + show/hide toggle
         + "Encrypted" badge
         + "Reveal" button (calls /reveal endpoint, logged in audit)

Each field shows:
- label (bold)
- description as help text
- Required indicator
- ReadOnly state (greyed out, no interaction)
- Deprecated warning if isDeprecated: true

Form behaviors:
- "Save Changes" saves entire group at once
- "Reset to Defaults" with confirmation dialog
- Unsaved changes indicator (dot on group name in sidebar)
- Block navigation if unsaved changes (useBlocker)
- Toast on success/error

---

## USER PREFERENCES PAGE

Route: /dashboard/profile (Preferences tab)
Available to: all authenticated users

Same dynamic form system, different data source:
- Loads from /api/v1/users/me/preferences
- Saves to /api/v1/users/me/preferences/:groupKey
- Theme change → applies immediately via ThemeContext
- Language change → applies immediately
- Items per page → stored in React Query cache as default

---

## HOW TO ADD A NEW SETTING IN PRODUCTION

Step 1: Add to schema file (no DB changes needed)
Step 2: Deploy
Step 3: App starts → sync engine detects new key → inserts with defaultValue
Step 4: Admin configures the actual value in /dashboard/settings
Done. Zero downtime, zero data loss.

---

## HOW TO ADD A NEW SETTING GROUP

Step 1: Create new schema file (e.g. payment.schema.ts)
Step 2: Add to schema/index.ts ALL_SETTING_GROUPS array
Step 3: Deploy
Step 4: Sync engine creates the group + all settings automatically
Step 5: New group appears in /dashboard/settings sidebar automatically
Done.

---

## NEW PERMISSIONS

Add to seed:
- settings:read   → view settings (admin role)
- settings:update → edit setting values (admin role)
- settings:reveal → see decrypted SECRET values (admin role, logged)
- settings:manage → create custom groups/settings (super-admin only)

---

## NEW ENV VARIABLE

SETTINGS_ENCRYPTION_KEY=64-char-hex-string

Add to .env.example:
# Settings System
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SETTINGS_ENCRYPTION_KEY=your-64-char-hex-key-here
```

---

## أمر الـ Plan:

```
/speckit.plan Same core tech stack. Additional packages:
- Backend: built-in Node.js crypto module for AES-256-GCM (no extra package needed)
- No new frontend packages — uses existing shadcn/ui (Switch, Select, Input, Textarea, Badge, Tabs)
```

---

## أوامر Tasks و Implement:

```
/speckit.tasks
```

```
/speckit.implement
```

---

## ✅ Acceptance Criteria

**Sync Engine:**
- [ ] عند الـ startup، settings جديدة في الـ schema بتتضاف للـ DB بالـ defaultValue
- [ ] Settings موجودة في الـ DB قيمها مش بتتغير بعد sync
- [ ] Setting اتحذف من الـ schema بيتعمله `isDeprecated: true` في الـ DB مش حذف
- [ ] Type mismatch بيظهر كـ warning في الـ logs مش error

**Settings Service:**
- [ ] `settingsService.get(EmailSettings.keys.smtp_host)` يرجع القيمة الصح
- [ ] SECRET values بتتخزن مشفرة (`enc:` prefix) في الـ DB
- [ ] SECRET values بتترجع decrypted لما الـ service تطلبها internally
- [ ] Cache بيشتغل: call ثانية من Redis مش DB
- [ ] Cache بيتمسح بعد أي set()

**API:**
- [ ] `GET /api/v1/settings` بيرجع كل الـ groups للـ admin
- [ ] Non-admin بيشوف الـ isPublic groups بس
- [ ] SECRET fields بترجع `••••••••` في الـ GET
- [ ] `/reveal` endpoint بيرجع القيمة الحقيقية وبيسجلها في الـ AuditLog
- [ ] `PATCH /api/v1/settings/email_settings` بيحفظ وبيمسح الـ cache

**Frontend:**
- [ ] Sidebar بيلود الـ groups من الـ API (مش hardcoded)
- [ ] كل نوع field بيتrender صح (STRING/NUMBER/BOOLEAN/SELECT/JSON/SECRET)
- [ ] "Unsaved changes" بيمنع الـ navigation من غير confirmation
- [ ] Theme preference بتتطبق فوراً من غير reload

**Type Safety:**
- [ ] `EmailSettings.keys.smtp_host` بيرجع `"email_settings.smtp_host"`
- [ ] TypeScript error لو استخدمت key مش موجود في الـ schema