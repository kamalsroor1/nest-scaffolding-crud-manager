# 🛠️ اختيار التقنيات — NestJS Scaffolding Dashboard

---

## Backend

| التقنية | الاختيار | السبب |
|---------|---------|-------|
| Framework | **NestJS** | Architecture منظمة، DI بيلت-إن، Modules، مناسب جداً للـ scaffolding |
| Language | **TypeScript** | Type safety، بيشتغل مع الـ generator كويس |
| ORM | **Prisma** | Type-safe، migration سهل، schema واضح، بيتولد منه الـ types تلقائياً |
| Database | **PostgreSQL** | ACID، JSON support، قوية في الـ relations |
| Cache | **Redis** | Session management، caching، queue-ready |
| Auth | **JWT** (Access + Refresh) | Stateless، standard، الـ refresh token بيحل مشكلة الـ expiry |
| Password | **bcrypt** | Industry standard للـ hashing |
| Validation | **class-validator** + **class-transformer** | بيشتغل native مع NestJS |
| File Upload | **Multer** + strategy pattern | Local في الأول، S3-ready بسهولة |
| Email | **Nodemailer** + **Handlebars** | Templates جميلة للـ emails |
| Logging | **Winston** | Structured logging، levels مختلفة |
| Testing | **Jest** + **Supertest** | الـ default في NestJS |
| API Docs | **Swagger** (@nestjs/swagger) | Auto-generated من الـ decorators |

---

## Frontend

| التقنية | الاختيار | السبب |
|---------|---------|-------|
| Framework | **React** + **Vite** | سريع، الـ build أسرع من CRA |
| Language | **TypeScript** | Type safety مع الـ API responses |
| State Management | **Context API** + **TanStack Query** | Auth في Context، server state في React Query |
| Routing | **React Router v6** | Standard |
| UI | **shadcn/ui** + **Tailwind CSS** | Components جاهزة، customizable، مش black-box |
| Forms | **React Hook Form** + **Zod** | Performance + validation بالـ schema |
| HTTP Client | **Axios** | Interceptors لـ token refresh |
| Tables | **TanStack Table** | Headless، powerful |
| Icons | **Lucide React** | Consistent، lightweight |
| Charts | **Recharts** | لو احتجنا داشبورد stats |

---

## DevOps & Tooling

| التقنية | الاختيار | السبب |
|---------|---------|-------|
| Containerization | **Docker** + **Docker Compose** | نشغّل كل حاجة بـ command واحد |
| Generator | **Plop.js** + **ts-morph** | Templates بـ Handlebars + AST manipulation |
| Linting | **ESLint** + **Prettier** | Consistent code style |
| Git Hooks | **Husky** + **lint-staged** | لا ترفع كود فيه errors |
| CI/CD | **GitHub Actions** | Run tests على كل PR |
| Env Validation | **Joi** | نتأكد إن كل الـ env variables موجودة قبل الـ startup |
