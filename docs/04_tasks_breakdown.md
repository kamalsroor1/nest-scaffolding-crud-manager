# ✅ تقسيم المهام والـ Sprints — NestJS Scaffolding Dashboard

---

## الإجمالي المتوقع: 6–8 أسابيع (part-time)

---

## Sprint 1 — Project Foundation (أسبوع 1)

### Backend

- [ ] إنشاء NestJS project بالـ structure الصح
- [ ] إعداد Prisma + PostgreSQL connection
- [ ] إعداد Config Module بـ Joi validation
- [ ] إعداد Global Exception Filter
- [ ] إعداد Global Response Interceptor
- [ ] إعداد Global Validation Pipe
- [ ] إعداد Swagger بـ Bearer Auth
- [ ] إعداد Winston/Pino Logger
- [ ] إعداد Health Check module
- [ ] كتابة `docker-compose.yml` (Postgres + Redis + App)

### Frontend

- [ ] إنشاء React project بـ Vite + TypeScript
- [ ] إعداد Axios instance مع interceptors
- [ ] إعداد React Router v6
- [ ] إعداد Tailwind CSS أو shadcn/ui
- [ ] إنشاء Layout component (Sidebar + Header)
- [ ] إعداد Dark Mode toggle

---

## Sprint 2 — Authentication (أسبوع 2)

### Backend

- [ ] User entity + Prisma migration
- [ ] Register endpoint مع email validation
- [ ] Login endpoint → يرجع Access + Refresh token
- [ ] JWT Strategy (Access Token guard)
- [ ] Refresh Token endpoint
- [ ] Logout endpoint (revoke refresh token)
- [ ] Forgot Password (generate reset token → send email)
- [ ] Reset Password endpoint
- [ ] Email Verification flow
- [ ] Unit tests للـ AuthService

### Frontend

- [ ] Login Page
- [ ] Register Page
- [ ] Forgot Password Page
- [ ] Reset Password Page
- [ ] Auth Context (store user + tokens)
- [ ] Protected Route component
- [ ] Token refresh logic في الـ Axios interceptor

---

## Sprint 3 — Users & RBAC (أسبوع 3)

### Backend

- [ ] Role + Permission entities + migrations
- [ ] Seed default roles (admin, user) والـ permissions
- [ ] `@Roles()` decorator
- [ ] `RolesGuard` بيتحقق من الـ JWT + Roles
- [ ] `@Permissions()` decorator
- [ ] `PermissionsGuard` للـ granular access
- [ ] Users CRUD endpoints (paginated list، get، create، update، soft delete)
- [ ] Me endpoints (get profile، update profile)
- [ ] Assign/Revoke roles لـ users
- [ ] Integration tests للـ Users endpoints

### Frontend

- [ ] Users Management Page (table + search + pagination)
- [ ] Create User Modal/Form
- [ ] Edit User Modal/Form
- [ ] Delete User Confirmation
- [ ] Role Assignment UI
- [ ] Profile Page

---

## Sprint 4 — File Upload & Utilities (أسبوع 4)

### Backend

- [ ] File entity + migration
- [ ] Multer setup لـ local uploads
- [ ] File type validation (MIME types)
- [ ] File size validation
- [ ] Single + Multiple file upload endpoints
- [ ] S3-ready service (strategy pattern — local أو S3)
- [ ] Redis Cache module إعداد
- [ ] Rate Limiting بـ Throttler
- [ ] Audit Log middleware (يسجل CREATE/UPDATE/DELETE)

### Frontend

- [ ] File Upload component (drag & drop)
- [ ] Image preview
- [ ] Upload progress indicator
- [ ] Reusable DataTable component (sort، filter، pagination)
- [ ] Toast notification system
- [ ] Confirmation Dialog component
- [ ] Loading states و Skeleton screens

---

## Sprint 5 — CRUD Generator (أسبوع 5–6)

ده أهم sprint في المشروع:

### Generator CLI

- [ ] إعداد `@nestjs/schematics` أو custom Plop.js
- [ ] Template لـ Entity (Prisma model)
- [ ] Template لـ `CreateDto` + `UpdateDto`
- [ ] Template لـ Service بالـ CRUD الكامل
- [ ] Template لـ Controller بالـ endpoints
- [ ] Template لـ Module بالـ imports الصح
- [ ] Template لـ Swagger decorators
- [ ] Auto-register الـ module الجديد في `AppModule`

### Generator — Frontend Part

- [ ] Template لـ API service functions
- [ ] Template لـ List Page (table + pagination)
- [ ] Template لـ Create/Edit Form
- [ ] Template لـ Types/Interfaces

### اختبار الـ Generator

- [ ] توليد `Product` entity وتشغيل المشروع من غير errors
- [ ] توليد `Category` entity مع relation لـ Product
- [ ] توثيق الـ generator في الـ README

---

## Sprint 6 — Testing & Polish (أسبوع 7–8)

### Testing

- [ ] Unit tests لكل الـ Services (Jest)
- [ ] Integration tests لكل الـ Controllers
- [ ] E2E tests للـ Auth flow كامل
- [ ] Test coverage > 70%

### Documentation & DevEx

- [ ] README.md شامل مع screenshots
- [ ] CONTRIBUTING.md
- [ ] `.env.example` مكتمل
- [ ] Postman Collection للـ API
- [ ] GitHub Actions CI/CD (run tests + lint على كل PR)
- [ ] npm publish للـ generator (اختياري)

---

## ملخص المهام

| Sprint | الأسابيع | العدد التقريبي للتاسكات |
|--------|----------|------------------------|
| Foundation | 1 | 16 |
| Authentication | 2 | 16 |
| Users & RBAC | 3 | 16 |
| File Upload & Utils | 4 | 15 |
| CRUD Generator | 5–6 | 14 |
| Testing & Polish | 7–8 | 12 |
| **الإجمالي** | **8** | **~89 task** |
