# 🚀 NestJS Scaffolding CRUD Manager

A production-ready **NestJS + React** boilerplate with a powerful **CRUD Generator** that scaffolds full-stack modules in seconds — Backend + Frontend + API Service + Types, all at once.

> Built for developers who want to skip the repetitive setup and focus on business logic.

---

## ✨ Features

### 🔐 Authentication & Security
- JWT Access + Refresh Token rotation
- HttpOnly Cookie for Refresh Token
- Email verification & Password reset
- Bcrypt password hashing (saltRounds: 12)
- Rate limiting on all auth endpoints
- Helmet + CORS configured

### 👥 Users & RBAC
- Full User CRUD with soft delete
- Role-Based Access Control (RBAC)
- Granular Permissions system (`read:users`, `create:products`, etc.)
- Custom `@Roles()` and `@Permissions()` decorators
- Default roles & permissions seeded automatically

### ⚙️ CRUD Generator ← *The Star Feature*
```bash
npm run generate -- --name=Product --fields="name:string,price:number,stock:number"
```
Generates in seconds:
- NestJS Module, Controller, Service
- CreateDto + UpdateDto (with class-validator)
- Prisma model auto-appended to schema
- React List Page + Create/Edit Form
- Axios API service + TypeScript types
- Swagger decorators on every endpoint

### 📦 Built-in Utilities
- Global Exception Filter (unified error format)
- Global Response Interceptor (unified success format)
- Generic Pagination helper
- File Upload — Local + S3-ready (strategy pattern)
- Audit Log (tracks all CREATE / UPDATE / DELETE)
- Redis Cache module ready
- Winston structured logging
- Health check endpoints (`/api/v1/health`)
- Swagger UI at `/api/docs`

### 🎨 Frontend Dashboard
- Auth pages (Login, Register, Forgot Password)
- Users & Roles management pages
- Reusable `DataTable` with sort, search, pagination
- Protected Routes with role-based access
- Dark Mode toggle
- Toast notifications
- Axios instance with auto token refresh

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Cache | Redis |
| Auth | JWT (Access + Refresh) |
| Frontend | React + Vite + TypeScript |
| UI | shadcn/ui + Tailwind CSS |
| Forms | React Hook Form + Zod |
| State | TanStack Query + Context API |
| Generator | Plop.js + ts-morph |
| Containers | Docker + Docker Compose |
| API Docs | Swagger / OpenAPI |
| Testing | Jest + Supertest |
| CI | GitHub Actions |

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- Docker + Docker Compose
- Git

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/nest-scaffolding-crud-manger.git
cd nest-scaffolding-crud-manger
```

### 2. Set up environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/scaffolding_db"
JWT_SECRET="your-super-secret-jwt-key-256-bit"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-256-bit"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
REDIS_URL="redis://localhost:6379"
FRONTEND_URL="http://localhost:5173"
MAIL_HOST="smtp.gmail.com"
MAIL_USER="your@email.com"
MAIL_PASS="your-app-password"
```

### 3. Start with Docker

```bash
docker-compose up -d
```

This starts: PostgreSQL + Redis + NestJS API + React Frontend

### 4. Run migrations & seed

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### 5. Open the app

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3000/api/v1 |
| Swagger Docs | http://localhost:3000/api/docs |

### Default Admin Credentials
```
Email:    admin@scaffold.dev
Password: Admin@123456
```

---

## ⚡ CRUD Generator

The most powerful feature — generate a complete full-stack module in one command:

```bash
cd backend
npm run generate -- --name=Product --fields="name:string,price:number,stock:number,isActive:boolean"
```

### What gets generated

**Backend:**
```
src/modules/products/
├── products.module.ts       ← auto-registered in AppModule
├── products.controller.ts   ← REST endpoints + Swagger decorators
├── products.service.ts      ← CRUD + pagination + soft delete
└── dto/
    ├── create-product.dto.ts
    └── update-product.dto.ts
```

**Frontend:**
```
src/pages/products/
├── ProductsListPage.tsx     ← table + search + pagination
└── ProductFormPage.tsx      ← create & edit form
src/api/products.api.ts      ← all API calls
src/types/product.types.ts   ← TypeScript interfaces
```

**Prisma Schema** (auto-appended):
```prisma
model Product {
  id        String   @id @default(uuid())
  name      String
  price     Float
  stock     Int
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?
}
```

Then just run:
```bash
npx prisma migrate dev --name "add_products"
npm run start:dev
# ✅ /api/v1/products is live with full CRUD
```

### Supported Field Types

| Type | Prisma | Validator |
|------|--------|-----------|
| `string` | String | @IsString() |
| `number` | Float | @IsNumber() |
| `int` | Int | @IsInt() |
| `boolean` | Boolean | @IsBoolean() |
| `date` | DateTime | @IsDateString() |
| `email` | String | @IsEmail() |
| `text` | String | @IsString() |

---

## 📁 Project Structure

```
nest-scaffolding-crud-manger/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── common/             # Guards, Filters, Interceptors, Decorators
│   │   ├── config/             # App configuration
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   ├── files/
│   │   │   └── health/
│   │   └── database/           # Prisma service
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── generators/             # CRUD generator templates
│       └── crud/
│           └── templates/
├── frontend/                   # React + Vite
│   └── src/
│       ├── api/
│       ├── components/
│       ├── contexts/
│       ├── hooks/
│       ├── pages/
│       └── types/
├── docs/                       # Project analysis documents
│   ├── 01_project_overview.md
│   ├── 02_database_schema.md
│   ├── 03_api_design.md
│   ├── 04_tasks_breakdown.md
│   ├── 05_project_plan.md
│   ├── 06_tech_stack.md
│   ├── 07_folder_structure.md
│   ├── 08_crud_generator_design.md
│   └── 09_security_checklist.md
├── docker-compose.yml
└── README.md
```

---

## 🌐 API Overview

All endpoints are prefixed with `/api/v1/` and return a unified response format:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users fetched successfully",
  "data": [],
  "meta": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 }
}
```

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login → access + refresh tokens |
| POST | `/auth/logout` | Revoke refresh token |
| POST | `/auth/refresh` | Get new access token |
| POST | `/auth/forgot-password` | Send reset email |
| POST | `/auth/reset-password` | Reset with token |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List users (paginated) |
| POST | `/users` | Create user |
| GET | `/users/:id` | Get user |
| PATCH | `/users/:id` | Update user |
| DELETE | `/users/:id` | Soft delete user |
| GET | `/users/me` | My profile |

📖 Full API docs: `http://localhost:3000/api/docs`

---

## 🧪 Testing

```bash
cd backend

# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

---

## 🐳 Docker

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f api

# Rebuild after changes
docker-compose up -d --build
```

Services started by Docker Compose:
- `db` — PostgreSQL on port 5432
- `redis` — Redis on port 6379
- `api` — NestJS on port 3000
- `frontend` — React on port 5173

---

## 📋 Analysis Documents

The `/docs` folder contains a full technical analysis of this project:

- **Project Overview** — what, why, and how
- **Database Schema** — ERD, Prisma models, soft delete strategy
- **API Design** — all endpoints, response format, pagination
- **Tasks Breakdown** — 89 tasks across 6 sprints
- **Project Plan** — milestones and timeline
- **Tech Stack** — every technology choice with justification
- **Folder Structure** — full directory tree
- **CRUD Generator Design** — how the generator works internally
- **Security Checklist** — OWASP, JWT best practices, validation

---

## 🤝 Contributing

Contributions are welcome! Please read `CONTRIBUTING.md` first.

```bash
# Fork the repo
# Create your feature branch
git checkout -b feature/amazing-feature

# Commit your changes
git commit -m "feat: add amazing feature"

# Push and open a PR
git push origin feature/amazing-feature
```

Commit message convention: [Conventional Commits](https://www.conventionalcommits.org/)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

Built with ❤️ by a Laravel developer learning the Node.js ecosystem.

---

<div align="center">
  <p>If this project helped you, please give it a ⭐ on GitHub!</p>
</div>
