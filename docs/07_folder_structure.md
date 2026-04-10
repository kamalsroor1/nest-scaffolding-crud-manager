# 📁 هيكل المجلدات — NestJS Scaffolding Dashboard

---

## Backend (NestJS)

```
backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   │
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── redis.config.ts
│   │   └── mail.config.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── permissions.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── dto/
│   │   │   └── pagination.dto.ts
│   │   ├── filters/
│   │   │   └── global-exception.filter.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── permissions.guard.ts
│   │   ├── interceptors/
│   │   │   ├── response.interceptor.ts
│   │   │   └── audit-log.interceptor.ts
│   │   ├── interfaces/
│   │   │   ├── pagination.interface.ts
│   │   │   └── jwt-payload.interface.ts
│   │   ├── pipes/
│   │   │   └── parse-uuid.pipe.ts
│   │   └── utils/
│   │       ├── pagination.helper.ts
│   │       ├── hash.helper.ts
│   │       └── token.helper.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── refresh-token.strategy.ts
│   │   │   └── dto/
│   │   │       ├── register.dto.ts
│   │   │       ├── login.dto.ts
│   │   │       ├── forgot-password.dto.ts
│   │   │       └── reset-password.dto.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       ├── update-user.dto.ts
│   │   │       └── user-response.dto.ts
│   │   │
│   │   ├── roles/
│   │   │   ├── roles.module.ts
│   │   │   ├── roles.controller.ts
│   │   │   ├── roles.service.ts
│   │   │   └── dto/
│   │   │       ├── create-role.dto.ts
│   │   │       └── assign-permission.dto.ts
│   │   │
│   │   ├── files/
│   │   │   ├── files.module.ts
│   │   │   ├── files.controller.ts
│   │   │   ├── files.service.ts
│   │   │   ├── storage/
│   │   │   │   ├── storage.interface.ts
│   │   │   │   ├── local.storage.ts
│   │   │   │   └── s3.storage.ts
│   │   │   └── dto/
│   │   │       └── file-response.dto.ts
│   │   │
│   │   └── health/
│   │       ├── health.module.ts
│   │       └── health.controller.ts
│   │
│   └── database/
│       └── prisma.service.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── test/
│   ├── app.e2e-spec.ts
│   └── auth.e2e-spec.ts
│
├── generators/                  ← CRUD Generator
│   ├── crud/
│   │   ├── index.ts             ← main generator script
│   │   └── templates/
│   │       ├── module.ts.hbs
│   │       ├── controller.ts.hbs
│   │       ├── service.ts.hbs
│   │       ├── create-dto.ts.hbs
│   │       ├── update-dto.ts.hbs
│   │       └── entity.prisma.hbs
│   └── README.md
│
├── .env
├── .env.example
├── docker-compose.yml
├── Dockerfile
└── package.json
```

---

## Frontend (React)

```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   │
│   ├── api/
│   │   ├── axios.ts             ← Axios instance + interceptors
│   │   ├── auth.api.ts
│   │   ├── users.api.ts
│   │   ├── roles.api.ts
│   │   └── files.api.ts
│   │
│   ├── contexts/
│   │   └── auth.context.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePagination.ts
│   │   └── useToast.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── ui/
│   │   │   ├── DataTable.tsx    ← Reusable table
│   │   │   ├── Modal.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── Toast.tsx
│   │   └── forms/
│   │       └── UserForm.tsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── ForgotPasswordPage.tsx
│   │   ├── users/
│   │   │   ├── UsersListPage.tsx
│   │   │   └── UserDetailPage.tsx
│   │   ├── roles/
│   │   │   └── RolesListPage.tsx
│   │   └── profile/
│   │       └── ProfilePage.tsx
│   │
│   ├── routes/
│   │   ├── index.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   └── api.types.ts
│   │
│   └── utils/
│       ├── format.ts
│       └── storage.ts
│
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Generator Output مثال

لو شغّلت:
```bash
npm run generate -- --name=Product --fields="name:string,price:number"
```

هيتولد:
```
src/modules/products/
├── products.module.ts
├── products.controller.ts
├── products.service.ts
└── dto/
    ├── create-product.dto.ts
    └── update-product.dto.ts
```

وفي الـ frontend:
```
src/pages/products/
├── ProductsListPage.tsx
└── ProductFormPage.tsx
src/api/
└── products.api.ts
src/types/
└── product.types.ts
```
