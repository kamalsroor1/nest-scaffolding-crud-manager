# 🌐 تصميم الـ REST API — NestJS Scaffolding Dashboard

---

## 1. مبادئ التصميم

- **Versioning:** كل الـ endpoints تبدأ بـ `/api/v1/`
- **Response Format:** موحد لكل الـ responses
- **Pagination:** Query params موحدة (`page`, `limit`, `sort`, `order`)
- **Swagger Docs:** كل endpoint موثق بـ `@ApiTags`, `@ApiOperation`, `@ApiResponse`

---

## 2. Response Format الموحد

### Success

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users fetched successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Must be a valid email" }
  ],
  "timestamp": "2025-01-01T00:00:00Z",
  "path": "/api/v1/users"
}
```

---

## 3. Auth Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | تسجيل مستخدم جديد | Public |
| POST | `/api/v1/auth/login` | تسجيل دخول + access/refresh tokens | Public |
| POST | `/api/v1/auth/logout` | إلغاء الـ refresh token | Private |
| POST | `/api/v1/auth/refresh` | تجديد الـ access token | Public (refresh token) |
| POST | `/api/v1/auth/forgot-password` | إرسال reset email | Public |
| POST | `/api/v1/auth/reset-password` | تغيير الباسورد بالـ token | Public |
| POST | `/api/v1/auth/verify-email` | تأكيد الـ email | Public |

### Login Response

```json
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "roles": ["admin"]
    }
  }
}
```

---

## 4. Users Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/v1/users` | قائمة المستخدمين (paginated) | `read:users` |
| POST | `/api/v1/users` | إنشاء مستخدم | `create:users` |
| GET | `/api/v1/users/:id` | تفاصيل مستخدم | `read:users` |
| PATCH | `/api/v1/users/:id` | تعديل مستخدم | `update:users` |
| DELETE | `/api/v1/users/:id` | حذف مستخدم (soft) | `delete:users` |
| GET | `/api/v1/users/me` | بيانات المستخدم الحالي | Authenticated |
| PATCH | `/api/v1/users/me` | تعديل بياناتي | Authenticated |
| POST | `/api/v1/users/me/avatar` | رفع صورة profile | Authenticated |

### Query Params للـ Listing

```
GET /api/v1/users?page=1&limit=10&sort=createdAt&order=desc&search=john&isActive=true
```

---

## 5. Roles & Permissions Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/v1/roles` | قائمة الـ roles | `read:roles` |
| POST | `/api/v1/roles` | إنشاء role جديد | `create:roles` |
| GET | `/api/v1/roles/:id` | تفاصيل role | `read:roles` |
| PATCH | `/api/v1/roles/:id` | تعديل role | `update:roles` |
| DELETE | `/api/v1/roles/:id` | حذف role | `delete:roles` |
| POST | `/api/v1/roles/:id/permissions` | إضافة permissions لـ role | `update:roles` |
| DELETE | `/api/v1/roles/:id/permissions/:permId` | إزالة permission | `update:roles` |
| POST | `/api/v1/users/:id/roles` | تعيين role لمستخدم | `update:users` |

---

## 6. Files Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/files/upload` | رفع ملف واحد | Authenticated |
| POST | `/api/v1/files/upload/multiple` | رفع ملفات متعددة | Authenticated |
| GET | `/api/v1/files/:id` | تفاصيل ملف | Authenticated |
| DELETE | `/api/v1/files/:id` | حذف ملف | Authenticated |

---

## 7. Health & Meta Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/health` | فحص حالة الـ server | Public |
| GET | `/api/v1/health/db` | فحص الـ database connection | Public |
| GET | `/api/v1/health/redis` | فحص الـ Redis connection | Public |

---

## 8. Pagination Query Params (موحدة لكل الـ endpoints)

```typescript
// كل list endpoint بيقبل نفس الـ params
interface PaginationQuery {
  page?:    number;   // default: 1
  limit?:   number;   // default: 10, max: 100
  sort?:    string;   // field name
  order?:   'asc' | 'desc'; // default: desc
  search?:  string;   // full-text search
}
```

---

## 9. Swagger Documentation

**الـ URL:** `http://localhost:3000/api/docs`

كل endpoint هيكون فيه:
- `@ApiTags('users')`
- `@ApiOperation({ summary: 'Get all users' })`
- `@ApiResponse({ status: 200, type: UserResponseDto })`
- `@ApiBearerAuth()`
- `@ApiQuery({ name: 'page', required: false })`
