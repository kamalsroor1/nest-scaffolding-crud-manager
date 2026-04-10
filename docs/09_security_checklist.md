# 🔒 Security Checklist — NestJS Scaffolding Dashboard

---

## Authentication & Tokens

- [ ] Access Token عمره قصير (15 دقيقة مش أكتر)
- [ ] Refresh Token في HttpOnly Cookie (مش localStorage)
- [ ] Refresh Token rotation — كل مرة بتجدد بتاخد token جديد والقديم بيتلغى
- [ ] Refresh Token في الـ database مع `isRevoked` flag
- [ ] Logout بيعمل revoke للـ refresh token فعلياً
- [ ] Password reset tokens بتنتهي بعد ساعة
- [ ] Email verification مطلوب قبل الـ login (اختياري حسب الـ use case)

---

## Passwords

- [ ] bcrypt مع `saltRounds: 12` (مش 10)
- [ ] Password strength validation (min 8 chars, uppercase, number, special char)
- [ ] مش بترجع الـ password في أي response
- [ ] مش بتسجل الـ password في الـ logs أبداً

---

## Input Validation

- [ ] `ValidationPipe` global مع `whitelist: true` و `forbidNonWhitelisted: true`
- [ ] Class-validator على كل الـ DTOs
- [ ] UUID validation على كل الـ id params
- [ ] File type validation (MIME type + extension)
- [ ] File size limit (مثلاً 5MB max)

---

## Rate Limiting

- [ ] Rate limiting على الـ auth endpoints (مثلاً 5 requests/minute للـ login)
- [ ] Rate limiting عام على كل الـ API
- [ ] حسب الـ IP مش بس حسب الـ user

---

## HTTP Security Headers

```typescript
// في main.ts
app.use(helmet());          // Security headers
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,        // للـ HttpOnly cookies
});
app.use(compression());     // GZIP compression
```

---

## Database

- [ ] Prisma Transactions للعمليات الحساسة
- [ ] Soft delete بدل Hard delete
- [ ] مش بتعرض الـ deletedAt في الـ responses
- [ ] Database credentials في environment variables فقط
- [ ] Parameterized queries (Prisma بيتكلم بدنا عليها تلقائياً)

---

## Environment Variables

```bash
# .env.example — مش فيه أي values حقيقية
DATABASE_URL="postgresql://user:password@localhost:5432/db"
JWT_SECRET="change-this-to-random-256-bit-secret"
JWT_REFRESH_SECRET="change-this-to-another-random-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
REDIS_URL="redis://localhost:6379"
MAIL_HOST="smtp.gmail.com"
FRONTEND_URL="http://localhost:5173"
```

- [ ] `.env` في `.gitignore` ✓
- [ ] Joi validation على كل الـ env vars عند الـ startup
- [ ] Secrets مش فيها default values

---

## Logging

- [ ] مش بتسجل الـ passwords أو tokens في الـ logs
- [ ] Structured logging (JSON format للـ production)
- [ ] Log levels مختلفة (debug في dev، warn/error في prod)
- [ ] Request ID في كل الـ logs للـ tracing

---

## OWASP Top 10 Checklist

| الثغرة | الحماية |
|--------|---------|
| Injection | Prisma parameterized queries |
| Broken Auth | JWT + Refresh rotation + Revocation |
| Sensitive Data | HTTPS + HttpOnly cookies + bcrypt |
| Security Misconfiguration | Helmet + CORS restricted |
| XSS | Helmet + React (escaped by default) |
| Broken Access Control | RBAC + Permission Guards |
| CSRF | SameSite cookies |
| Rate Limiting | Throttler |
