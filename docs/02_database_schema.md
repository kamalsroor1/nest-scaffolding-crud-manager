# 🗄️ تحليل قاعدة البيانات — NestJS Scaffolding Dashboard

---

## 1. اختيار قاعدة البيانات

| قاعدة البيانات | السبب |
|---------------|-------|
| **PostgreSQL** (الرئيسية) | ACID، JSON support، full-text search، relations قوية |
| **Redis** | Sessions، Cache، Queue jobs |

**ORM المقترح:** Prisma — أسهل في الـ migration وفيه type safety أقوى من TypeORM

---

## 2. الـ Entities الأساسية

### 2.1 User

```prisma
model User {
  id          String    @id @default(uuid())
  email       String    @unique
  username    String    @unique
  password    String
  firstName   String?
  lastName    String?
  avatar      String?
  isActive    Boolean   @default(true)
  isVerified  Boolean   @default(false)
  
  // Relations
  roles       UserRole[]
  tokens      RefreshToken[]
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime? // Soft delete
}
```

### 2.2 Role & Permission (RBAC)

```prisma
model Role {
  id          String       @id @default(uuid())
  name        String       @unique  // "admin", "user", "moderator"
  description String?
  
  permissions RolePermission[]
  users       UserRole[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Permission {
  id          String           @id @default(uuid())
  action      String           // "read", "create", "update", "delete"
  resource    String           // "users", "products", "orders"
  description String?
  
  roles       RolePermission[]
  
  @@unique([action, resource])
}

model RolePermission {
  roleId       String
  permissionId String
  
  role         Role       @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])
  
  @@id([roleId, permissionId])
}

model UserRole {
  userId    String
  roleId    String
  
  user      User   @relation(fields: [userId], references: [id])
  role      Role   @relation(fields: [roleId], references: [id])
  
  assignedAt DateTime @default(now())
  
  @@id([userId, roleId])
}
```

### 2.3 Refresh Token

```prisma
model RefreshToken {
  id          String    @id @default(uuid())
  token       String    @unique
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  
  expiresAt   DateTime
  isRevoked   Boolean   @default(false)
  userAgent   String?
  ipAddress   String?
  
  createdAt   DateTime  @default(now())
}
```

### 2.4 File / Media

```prisma
model File {
  id          String    @id @default(uuid())
  filename    String
  originalName String
  mimeType    String
  size        Int       // bytes
  path        String    // local path أو S3 key
  url         String    // public URL
  
  uploadedBy  String
  user        User      @relation(fields: [uploadedBy], references: [id])
  
  createdAt   DateTime  @default(now())
}
```

### 2.5 Audit Log (اختياري — بس بيثبت نضج تقني)

```prisma
model AuditLog {
  id         String   @id @default(uuid())
  userId     String?
  action     String   // "CREATE", "UPDATE", "DELETE"
  resource   String   // "User", "Role", etc.
  resourceId String?
  oldValue   Json?
  newValue   Json?
  ipAddress  String?
  userAgent  String?
  
  createdAt  DateTime @default(now())
}
```

---

## 3. ERD (Entity Relationship Diagram)

```
User ──────────── UserRole ──────── Role
  │                                   │
  │                           RolePermission
  │                                   │
  ├── RefreshToken               Permission
  │
  └── File

AuditLog (standalone — يسجل كل العمليات)
```

---

## 4. Soft Delete Strategy

بدل ما تمسح الـ records فعلياً، نضيف `deletedAt`:

```prisma
// كل الـ models الأساسية فيها
deletedAt DateTime? // null = active, date = deleted
```

**في Prisma نستخدم middleware:**

```typescript
prisma.$use(async (params, next) => {
  if (params.action === 'delete') {
    params.action = 'update';
    params.args['data'] = { deletedAt: new Date() };
  }
  if (params.action === 'findMany') {
    params.args.where = {
      ...params.args.where,
      deletedAt: null,
    };
  }
  return next(params);
});
```

---

## 5. Indexing Strategy

```prisma
// ضيف الـ indexes دي على كل model بتعمله
@@index([createdAt])
@@index([isActive])
@@index([deletedAt])

// على User
@@index([email])
@@index([username])

// على RefreshToken
@@index([userId])
@@index([expiresAt])
```

---

## 6. Migration Naming Convention

```bash
# دايما اسم الـ migration يكون descriptive
npx prisma migrate dev --name "create_users_roles_permissions"
npx prisma migrate dev --name "add_refresh_tokens"
npx prisma migrate dev --name "add_soft_delete_to_users"
```

---

## 7. Seed Data

```typescript
// prisma/seed.ts
async function main() {
  // 1. Create default permissions
  const permissions = await createDefaultPermissions();
  
  // 2. Create default roles
  const adminRole = await createRole('admin', permissions);
  const userRole  = await createRole('user', ['read:profile']);
  
  // 3. Create super admin user
  await createSuperAdmin(adminRole.id);
}
```

**Default Permissions:**

| Resource | Actions |
|----------|---------|
| users | read، create، update، delete |
| roles | read، create، update، delete |
| files | read، create، delete |
| audit_logs | read |
