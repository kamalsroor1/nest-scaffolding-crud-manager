# 📝 SPEC 7: Advanced Dynamic Settings System (Schema-Based)

> **الموقع في الخطة:** بعد Spec 6 (Testing & Polish)
> **المنهجية:** Schema-as-Source-of-Truth
> **الإصدار:** v2 — مراجَع ومكتمل

---

## 🗺️ فهرس المحتوى

1. [الفلسفة الأساسية](#1-الفلسفة-الأساسية)
2. [هيكل الملفات الكامل](#2-هيكل-الملفات-الكامل)
3. [Prisma Schema](#3-prisma-schema)
4. [نظام الـ Schema Definition](#4-نظام-الـ-schema-definition)
5. [ملفات الـ Schema الجاهزة](#5-ملفات-الـ-schema-الجاهزة)
6. [Sync Engine](#6-sync-engine)
7. [Encryption Service](#7-encryption-service)
8. [Settings Service](#8-settings-service)
9. [User Preferences Service](#9-user-preferences-service)
10. [API Endpoints](#10-api-endpoints)
11. [Integration مع باقي الـ Modules](#11-integration-مع-باقي-الـ-modules)
12. [Frontend](#12-frontend)
13. [الـ Spec Prompt الكامل](#13-الـ-spec-prompt-الكامل)
14. [Plan + Tasks + Implement](#14-plan--tasks--implement)
15. [Acceptance Criteria](#15-acceptance-criteria)

---

## 1. الفلسفة الأساسية

```
┌─────────────────────────────────────────────────────────────┐
│  Schema Files (TypeScript)  →  تحكم في الـ STRUCTURE        │
│  Database (PostgreSQL)      →  تحفظ الـ VALUES              │
│  Sync Engine                →  يوفق بينهم عند كل startup    │
│  Redis Cache                →  يسرّع الـ read operations    │
└─────────────────────────────────────────────────────────────┘

القاعدة الذهبية:
  Schema  = من يحدد ما الذي يوجد
  Database = من يحفظ ما تم تكوينه
  Sync Engine = لا يمس القيم أبداً — فقط يضيف المفقود
```

**لماذا هذا الأفضل من الـ Migrations؟**

| المشكلة | Migrations | Schema-Based |
|---------|------------|--------------|
| Deploy جديد | يخاطر بمسح القيم | آمن تماماً |
| إضافة setting | كتابة migration script | سطر TypeScript فقط |
| حذف setting بالخطأ | البيانات تُفقد | `isDeprecated: true` فقط |
| Type-safety | لا يوجد | TypeScript كامل |
| مراجعة الكود | تقرأ SQL | تقرأ TypeScript واضح |

---

## 2. هيكل الملفات الكامل

```
src/modules/settings/
├── schema/
│   ├── groups/
│   │   ├── general.schema.ts
│   │   ├── email.schema.ts
│   │   ├── security.schema.ts
│   │   ├── storage.schema.ts
│   │   └── notifications.schema.ts
│   └── index.ts                         ← ALL_SETTING_GROUPS array
├── settings.schema.ts                   ← defineSettingGroup() + core types
├── settings-sync.service.ts             ← startup reconciliation engine
├── settings.service.ts                  ← runtime get/set/cache
├── settings.controller.ts               ← REST API
├── settings.module.ts
└── dto/
    ├── update-setting-group.dto.ts
    ├── create-setting-group.dto.ts
    └── create-setting-definition.dto.ts

src/modules/user-preferences/
├── schema/
│   ├── groups/
│   │   ├── appearance.schema.ts
│   │   ├── notifications.schema.ts
│   │   └── dashboard.schema.ts
│   └── index.ts                         ← ALL_PREFERENCE_GROUPS array
├── user-preferences.schema.ts           ← definePreferenceGroup() + types
├── user-preferences-sync.service.ts
├── user-preferences.service.ts
├── user-preferences.controller.ts
└── user-preferences.module.ts

src/common/services/
└── encryption.service.ts                ← AES-256-GCM (مشترك)

frontend/src/
├── pages/
│   ├── settings/
│   │   ├── SettingsPage.tsx             ← Admin settings page
│   │   └── components/
│   │       ├── SettingsGroupSidebar.tsx
│   │       ├── SettingsForm.tsx          ← Dynamic form renderer
│   │       └── fields/
│   │           ├── StringField.tsx
│   │           ├── NumberField.tsx
│   │           ├── BooleanField.tsx
│   │           ├── SelectField.tsx
│   │           ├── JsonField.tsx
│   │           └── SecretField.tsx
│   └── profile/
│       └── tabs/
│           └── PreferencesTab.tsx        ← User preferences (reuses same fields)
└── contexts/
    └── PreferencesContext.tsx            ← Global user preferences state
```

---

## 3. Prisma Schema

```prisma
// ─── SYSTEM SETTINGS ──────────────────────────────────────

model SettingGroup {
  id          String    @id @default(uuid())
  key         String    @unique
  label       String
  description String?
  icon        String?           // lucide-react icon name
  order       Int       @default(0)
  isPublic    Boolean   @default(false)  // non-admins can READ
  settings    Setting[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Setting {
  id           String       @id @default(uuid())
  groupId      String
  group        SettingGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
  key          String
  fullKey      String       @unique   // "group_key.setting_key"
  label        String
  description  String?
  type         SettingType
  value        String       @default("")
  defaultValue String?
  options      Json?        // [{ label, value }] for SELECT type
  validation   Json?        // { required?, min?, max?, pattern?, patternMessage? }
  isRequired   Boolean      @default(false)
  isReadOnly   Boolean      @default(false)
  isPublic     Boolean      @default(false)
  isDeprecated Boolean      @default(false)
  isCustom     Boolean      @default(false)  // created via API, not from schema
  order        Int          @default(0)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@unique([groupId, key])
  @@index([fullKey])
  @@index([isDeprecated])
}

enum SettingType {
  STRING
  NUMBER
  BOOLEAN
  SELECT
  JSON
  SECRET
}

// ─── USER PREFERENCES ─────────────────────────────────────

model UserPreferenceGroup {
  id          String           @id @default(uuid())
  key         String           @unique
  label       String
  description String?
  icon        String?
  order       Int              @default(0)
  preferences UserPreference[]
}

model UserPreference {
  id           String                @id @default(uuid())
  groupId      String
  group        UserPreferenceGroup   @relation(fields: [groupId], references: [id], onDelete: Cascade)
  key          String
  fullKey      String                @unique
  label        String
  description  String?
  type         SettingType           // reuses same enum (no SECRET for user prefs)
  defaultValue String?
  options      Json?
  order        Int                   @default(0)
  values       UserPreferenceValue[]

  @@unique([groupId, key])
}

model UserPreferenceValue {
  id           String         @id @default(uuid())
  userId       String
  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  preferenceId String
  preference   UserPreference @relation(fields: [preferenceId], references: [id], onDelete: Cascade)
  value        String
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  @@unique([userId, preferenceId])
  @@index([userId])
}
```

**⚠️ إضافة للـ User model الموجود:**
```prisma
model User {
  // ... existing fields ...
  preferenceValues UserPreferenceValue[]
}
```

---

## 4. نظام الـ Schema Definition

### `settings.schema.ts` — Core Types + Helper

```typescript
export type SettingType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'JSON' | 'SECRET';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SettingValidation {
  required?: boolean;
  min?: number;       // for NUMBER: numeric min, for STRING: min length
  max?: number;       // for NUMBER: numeric max, for STRING: max length
  pattern?: string;   // regex pattern as string
  patternMessage?: string;
}

export interface SettingDefinition<T extends SettingType = SettingType> {
  type: T;
  label: string;
  description?: string;
  defaultValue: T extends 'BOOLEAN' ? boolean
               : T extends 'NUMBER' ? number
               : T extends 'JSON'   ? object | any[]
               : string;
  options?: T extends 'SELECT' ? SelectOption[] : never;
  validation?: SettingValidation;
  isReadOnly?: boolean;
  isPublic?: boolean;
  order: number;
}

export interface SettingGroupSchema<T extends Record<string, SettingDefinition>> {
  key: string;
  label: string;
  description?: string;
  icon?: string;
  order: number;
  isPublic?: boolean;
  settings: T;
}

// Helper with full TypeScript inference — generates .keys property
export function defineSettingGroup<T extends Record<string, SettingDefinition>>(
  schema: SettingGroupSchema<T>
): SettingGroupSchema<T> & { keys: { [K in keyof T]: string } } {
  const keys = Object.fromEntries(
    Object.keys(schema.settings).map((k) => [k, `${schema.key}.${k}`])
  ) as { [K in keyof T]: string };

  return { ...schema, keys };
}

// Shared serialization helpers
export function serializeSettingValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function parseSettingValue(raw: string, type: SettingType): unknown {
  if (raw === '' || raw === null || raw === undefined) return null;
  switch (type) {
    case 'NUMBER':  return Number(raw);
    case 'BOOLEAN': return raw === 'true';
    case 'JSON':    try { return JSON.parse(raw); } catch { return null; }
    default:        return raw;
  }
}
```

---

## 5. ملفات الـ Schema الجاهزة

### `schema/groups/general.schema.ts`

```typescript
import { defineSettingGroup } from '../../settings.schema';

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
      description: 'Base URL used in emails and links (no trailing slash)',
      defaultValue: 'http://localhost:3000',
      validation: { required: true, pattern: '^https?://', patternMessage: 'Must start with http:// or https://' },
      order: 2,
    },
    app_logo_url: {
      type: 'STRING',
      label: 'Logo URL',
      description: 'Full URL to your application logo image',
      defaultValue: '',
      order: 3,
    },
    support_email: {
      type: 'STRING',
      label: 'Support Email',
      description: 'Shown to users in error pages and emails',
      defaultValue: 'support@example.com',
      validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$', patternMessage: 'Must be a valid email' },
      order: 4,
    },
    maintenance_mode: {
      type: 'BOOLEAN',
      label: 'Maintenance Mode',
      description: 'When enabled, only admins can access the application',
      defaultValue: false,
      order: 5,
    },
    maintenance_message: {
      type: 'STRING',
      label: 'Maintenance Message',
      description: 'Message shown to users during maintenance',
      defaultValue: 'We are currently down for maintenance. Please try again later.',
      order: 6,
    },
  },
});
```

### `schema/groups/email.schema.ts`

```typescript
import { defineSettingGroup } from '../../settings.schema';

export const EmailSettings = defineSettingGroup({
  key: 'email_settings',
  label: 'Email Configuration',
  icon: 'Mail',
  order: 2,
  settings: {
    smtp_host: {
      type: 'STRING',
      label: 'SMTP Host',
      description: 'e.g. smtp.gmail.com',
      defaultValue: '',
      validation: { required: true },
      order: 1,
    },
    smtp_port: {
      type: 'NUMBER',
      label: 'SMTP Port',
      description: 'Common values: 587 (TLS), 465 (SSL), 25 (plain)',
      defaultValue: 587,
      validation: { required: true, min: 1, max: 65535 },
      order: 2,
    },
    smtp_secure: {
      type: 'BOOLEAN',
      label: 'Use TLS/SSL',
      description: 'Enable for port 465. Leave off for port 587 (STARTTLS)',
      defaultValue: false,
      order: 3,
    },
    smtp_user: {
      type: 'STRING',
      label: 'SMTP Username',
      defaultValue: '',
      order: 4,
    },
    smtp_password: {
      type: 'SECRET',
      label: 'SMTP Password',
      defaultValue: '',
      order: 5,
    },
    smtp_from_name: {
      type: 'STRING',
      label: 'From Name',
      description: 'Sender name shown in emails',
      defaultValue: 'My App',
      order: 6,
    },
    smtp_from_email: {
      type: 'STRING',
      label: 'From Email',
      description: 'Sender email address',
      defaultValue: 'noreply@example.com',
      validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$', patternMessage: 'Must be a valid email' },
      order: 7,
    },
  },
});
```

### `schema/groups/security.schema.ts`

```typescript
import { defineSettingGroup } from '../../settings.schema';

export const SecuritySettings = defineSettingGroup({
  key: 'security_settings',
  label: 'Security',
  icon: 'Shield',
  order: 3,
  settings: {
    access_token_ttl: {
      type: 'NUMBER',
      label: 'Access Token Lifetime (seconds)',
      description: 'Default: 900 (15 minutes). Min: 60, Max: 86400 (24h)',
      defaultValue: 900,
      validation: { required: true, min: 60, max: 86400 },
      order: 1,
    },
    refresh_token_ttl: {
      type: 'NUMBER',
      label: 'Refresh Token Lifetime (seconds)',
      description: 'Default: 604800 (7 days). Min: 3600 (1h)',
      defaultValue: 604800,
      validation: { required: true, min: 3600 },
      order: 2,
    },
    max_login_attempts: {
      type: 'NUMBER',
      label: 'Max Failed Login Attempts',
      description: 'Account locked after this many consecutive failures',
      defaultValue: 5,
      validation: { min: 1, max: 20 },
      order: 3,
    },
    lockout_duration: {
      type: 'NUMBER',
      label: 'Lockout Duration (seconds)',
      description: 'Default: 900 (15 minutes)',
      defaultValue: 900,
      validation: { min: 60 },
      order: 4,
    },
    password_min_length: {
      type: 'NUMBER',
      label: 'Minimum Password Length',
      defaultValue: 8,
      validation: { min: 6, max: 128 },
      order: 5,
    },
    require_uppercase: {
      type: 'BOOLEAN',
      label: 'Require Uppercase Letter in Password',
      defaultValue: true,
      order: 6,
    },
    require_number: {
      type: 'BOOLEAN',
      label: 'Require Number in Password',
      defaultValue: true,
      order: 7,
    },
    require_special_char: {
      type: 'BOOLEAN',
      label: 'Require Special Character in Password',
      defaultValue: true,
      order: 8,
    },
    require_email_verification: {
      type: 'BOOLEAN',
      label: 'Require Email Verification',
      description: 'Users must verify email before logging in',
      defaultValue: true,
      order: 9,
    },
    allowed_origins: {
      type: 'JSON',
      label: 'Allowed CORS Origins',
      description: 'JSON array of allowed origins. Example: ["https://myapp.com"]',
      defaultValue: [],
      order: 10,
    },
  },
});
```

### `schema/groups/storage.schema.ts`

```typescript
import { defineSettingGroup } from '../../settings.schema';

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
        { label: 'Amazon S3',  value: 's3' },
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
      description: 'JSON array of allowed MIME types',
      defaultValue: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
      order: 3,
    },
    s3_endpoint: {
      type: 'STRING',
      label: 'S3 / R2 Endpoint URL',
      description: 'Leave empty for standard AWS S3. Set for Cloudflare R2 or custom S3-compatible',
      defaultValue: '',
      order: 4,
    },
    s3_bucket: {
      type: 'STRING',
      label: 'Bucket Name',
      defaultValue: '',
      order: 5,
    },
    s3_region: {
      type: 'SELECT',
      label: 'S3 Region',
      defaultValue: 'us-east-1',
      options: [
        { label: 'US East (N. Virginia)',     value: 'us-east-1' },
        { label: 'US West (Oregon)',          value: 'us-west-2' },
        { label: 'EU (Frankfurt)',            value: 'eu-central-1' },
        { label: 'EU (Ireland)',              value: 'eu-west-1' },
        { label: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' },
      ],
      order: 6,
    },
    s3_access_key: {
      type: 'SECRET',
      label: 'Access Key ID',
      defaultValue: '',
      order: 7,
    },
    s3_secret_key: {
      type: 'SECRET',
      label: 'Secret Access Key',
      defaultValue: '',
      order: 8,
    },
    s3_public_base_url: {
      type: 'STRING',
      label: 'Public Base URL',
      description: 'CDN or public URL prefix for served files. Example: https://cdn.myapp.com',
      defaultValue: '',
      order: 9,
    },
  },
});
```

### `schema/groups/notifications.schema.ts`

```typescript
import { defineSettingGroup } from '../../settings.schema';

export const NotificationSettings = defineSettingGroup({
  key: 'notification_settings',
  label: 'Notifications',
  icon: 'Bell',
  order: 5,
  settings: {
    enable_email_notifications: {
      type: 'BOOLEAN',
      label: 'Enable Email Notifications',
      description: 'Master switch for all system emails',
      defaultValue: true,
      order: 1,
    },
    notify_admin_on_new_user: {
      type: 'BOOLEAN',
      label: 'Notify Admin on New Registration',
      defaultValue: true,
      order: 2,
    },
    notify_user_on_login: {
      type: 'BOOLEAN',
      label: 'Notify User on New Login',
      description: 'Sends email alert when user logs in from a new device',
      defaultValue: false,
      order: 3,
    },
    notify_user_on_password_change: {
      type: 'BOOLEAN',
      label: 'Notify User on Password Change',
      defaultValue: true,
      order: 4,
    },
    admin_notification_email: {
      type: 'STRING',
      label: 'Admin Notification Email',
      description: 'Where to send admin alerts (defaults to support email if empty)',
      defaultValue: '',
      order: 5,
    },
  },
});
```

### `schema/index.ts` — Master Registry

```typescript
import { GeneralSettings }      from './groups/general.schema';
import { EmailSettings }        from './groups/email.schema';
import { SecuritySettings }     from './groups/security.schema';
import { StorageSettings }      from './groups/storage.schema';
import { NotificationSettings } from './groups/notifications.schema';

// ─────────────────────────────────────────────────────────────
// THE MASTER REGISTRY
// To add a new settings group:
//   1. Create src/modules/settings/schema/groups/my-group.schema.ts
//   2. Add it to this array — nothing else needed
// ─────────────────────────────────────────────────────────────
export const ALL_SETTING_GROUPS = [
  GeneralSettings,
  EmailSettings,
  SecuritySettings,
  StorageSettings,
  NotificationSettings,
] as const;

// Re-export all groups for type-safe usage in other modules
export {
  GeneralSettings,
  EmailSettings,
  SecuritySettings,
  StorageSettings,
  NotificationSettings,
};
```

### User Preferences Schemas

#### `user-preferences/schema/groups/appearance.schema.ts`

```typescript
import { defineSettingGroup } from '../../user-preferences.schema';

export const AppearancePreferences = defineSettingGroup({
  key: 'appearance',
  label: 'Appearance',
  icon: 'Palette',
  order: 1,
  settings: {
    theme: {
      type: 'SELECT',
      label: 'Theme',
      defaultValue: 'system',
      options: [
        { label: 'Light',  value: 'light' },
        { label: 'Dark',   value: 'dark' },
        { label: 'System', value: 'system' },
      ],
      order: 1,
    },
    language: {
      type: 'SELECT',
      label: 'Language',
      defaultValue: 'en',
      options: [
        { label: 'English', value: 'en' },
        { label: 'العربية', value: 'ar' },
        { label: 'Français', value: 'fr' },
      ],
      order: 2,
    },
    sidebar_collapsed: {
      type: 'BOOLEAN',
      label: 'Collapse Sidebar by Default',
      defaultValue: false,
      order: 3,
    },
    items_per_page: {
      type: 'SELECT',
      label: 'Default Items Per Page',
      defaultValue: '10',
      options: [
        { label: '10',  value: '10' },
        { label: '25',  value: '25' },
        { label: '50',  value: '50' },
        { label: '100', value: '100' },
      ],
      order: 4,
    },
    date_format: {
      type: 'SELECT',
      label: 'Date Format',
      defaultValue: 'MMM DD, YYYY',
      options: [
        { label: 'Jan 01, 2025',  value: 'MMM DD, YYYY' },
        { label: '01/01/2025',    value: 'DD/MM/YYYY' },
        { label: '2025-01-01',    value: 'YYYY-MM-DD' },
      ],
      order: 5,
    },
  },
});
```

#### `user-preferences/schema/groups/notifications.schema.ts`

```typescript
export const NotificationPreferences = defineSettingGroup({
  key: 'notifications',
  label: 'Notifications',
  icon: 'Bell',
  order: 2,
  settings: {
    email_alerts: {
      type: 'BOOLEAN',
      label: 'Email Alerts',
      description: 'Receive important alerts via email',
      defaultValue: true,
      order: 1,
    },
    browser_notifications: {
      type: 'BOOLEAN',
      label: 'Browser Notifications',
      defaultValue: false,
      order: 2,
    },
    alert_on_login: {
      type: 'BOOLEAN',
      label: 'Alert Me on New Login',
      defaultValue: false,
      order: 3,
    },
  },
});
```

#### `user-preferences/schema/index.ts`

```typescript
import { AppearancePreferences }   from './groups/appearance.schema';
import { NotificationPreferences } from './groups/notifications.schema';
import { DashboardPreferences }    from './groups/dashboard.schema';

export const ALL_PREFERENCE_GROUPS = [
  AppearancePreferences,
  NotificationPreferences,
  DashboardPreferences,
] as const;

export { AppearancePreferences, NotificationPreferences, DashboardPreferences };
```

---

## 6. Sync Engine

### `settings-sync.service.ts`

```typescript
@Injectable()
export class SettingsSyncService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async onModuleInit(): Promise<void> {
    const start = Date.now();
    this.logger.log('[Settings Sync] Starting...');
    try {
      await this.syncAllGroups();
      await this.deprecateRemovedSettings();
      this.logger.log(`[Settings Sync] Complete in ${Date.now() - start}ms`);
    } catch (error) {
      // NEVER throw — a settings sync failure must not crash the app
      this.logger.error('[Settings Sync] Failed:', error.message);
    }
  }

  private async syncAllGroups(): Promise<void> {
    for (const groupSchema of ALL_SETTING_GROUPS) {
      await this.syncGroup(groupSchema);
    }
  }

  private async syncGroup(schema: SettingGroupSchema<any>): Promise<void> {
    // Upsert group — update display metadata but never destroy data
    const group = await this.prisma.settingGroup.upsert({
      where:  { key: schema.key },
      create: {
        key:         schema.key,
        label:       schema.label,
        description: schema.description ?? null,
        icon:        schema.icon ?? null,
        order:       schema.order,
        isPublic:    schema.isPublic ?? false,
      },
      update: {
        label:       schema.label,
        description: schema.description ?? null,
        icon:        schema.icon ?? null,
        order:       schema.order,
        isPublic:    schema.isPublic ?? false,
        // ⛔ Never update: settings values
      },
    });

    for (const [key, def] of Object.entries(schema.settings)) {
      const existing = await this.prisma.setting.findUnique({
        where: { groupId_key: { groupId: group.id, key } },
      });

      if (!existing) {
        await this.prisma.setting.create({
          data: {
            groupId:      group.id,
            key,
            fullKey:      `${schema.key}.${key}`,
            label:        def.label,
            description:  def.description ?? null,
            type:         def.type as any,
            value:        serializeSettingValue(def.defaultValue),
            defaultValue: serializeSettingValue(def.defaultValue),
            options:      def.options ?? null,
            validation:   def.validation ?? null,
            isReadOnly:   def.isReadOnly ?? false,
            isPublic:     def.isPublic ?? false,
            isRequired:   def.validation?.required ?? false,
            order:        def.order,
            isDeprecated: false,
            isCustom:     false,
          },
        });
        this.logger.log(`[Settings Sync] ✓ Created: ${schema.key}.${key}`);

      } else {
        // Type mismatch — warn but do NOT auto-migrate (dangerous)
        if (existing.type !== def.type) {
          this.logger.warn(
            `[Settings Sync] ⚠ Type mismatch for "${schema.key}.${key}": ` +
            `DB="${existing.type}", Schema="${def.type}". Manual migration required.`
          );
        }

        await this.prisma.setting.update({
          where: { id: existing.id },
          data: {
            label:        def.label,
            description:  def.description ?? null,
            options:      def.options ?? null,
            validation:   def.validation ?? null,
            isReadOnly:   def.isReadOnly ?? false,
            order:        def.order,
            isDeprecated: false,   // un-deprecate if re-added to schema
            isRequired:   def.validation?.required ?? false,
            // ⛔ Never update: value, defaultValue, type, isCustom
          },
        });
      }
    }
  }

  private async deprecateRemovedSettings(): Promise<void> {
    const allSchemaFullKeys = ALL_SETTING_GROUPS.flatMap((g) =>
      Object.keys(g.settings).map((k) => `${g.key}.${k}`)
    );

    const deprecated = await this.prisma.setting.updateMany({
      where: {
        fullKey:      { notIn: allSchemaFullKeys },
        isDeprecated: false,
        isCustom:     false,   // custom settings are managed independently
      },
      data: { isDeprecated: true },
    });

    if (deprecated.count > 0) {
      this.logger.warn(`[Settings Sync] Deprecated ${deprecated.count} removed settings`);
    }
  }
}
```

---

## 7. Encryption Service

### `src/common/services/encryption.service.ts`

```typescript
@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private readonly config: ConfigService) {
    const hexKey = this.config.get<string>('SETTINGS_ENCRYPTION_KEY');
    if (!hexKey || hexKey.length !== 64) {
      throw new Error('SETTINGS_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
    }
    this.key = Buffer.from(hexKey, 'hex');
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    // Format: iv(32hex) + authTag(32hex) + ciphertext(hex)
    return iv.toString('hex') + authTag.toString('hex') + encrypted.toString('hex');
  }

  decrypt(ciphertext: string): string {
    const iv      = Buffer.from(ciphertext.slice(0, 32), 'hex');
    const authTag = Buffer.from(ciphertext.slice(32, 64), 'hex');
    const data    = Buffer.from(ciphertext.slice(64), 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(data) + decipher.final('utf8');
  }
}
```

---

## 8. Settings Service

### `settings.service.ts`

```typescript
@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma:     PrismaService,
    private readonly redis:      RedisService,
    private readonly encryption: EncryptionService,
  ) {}

  // ─── READ ────────────────────────────────────────────────

  async get(fullKey: string): Promise<string | null> {
    const cached = await this.redis.get(`settings:${fullKey}`);
    if (cached !== null) return cached;

    const setting = await this.prisma.setting.findUnique({ where: { fullKey } });
    if (!setting) return null;

    let raw = setting.value || setting.defaultValue || null;
    if (!raw) return null;

    // Auto-decrypt SECRET values
    if (setting.type === 'SECRET' && raw.startsWith('enc:')) {
      try { raw = this.encryption.decrypt(raw.slice(4)); }
      catch { return null; } // return null if decryption fails (bad key)
    }

    await this.redis.set(`settings:${fullKey}`, raw, 300);
    return raw;
  }

  async getTyped<T>(fullKey: string): Promise<T | null> {
    const raw = await this.get(fullKey);
    if (raw === null) return null;

    const setting = await this.prisma.setting.findUnique({
      where: { fullKey },
      select: { type: true },
    });
    if (!setting) return null;

    return parseSettingValue(raw, setting.type as SettingType) as T;
  }

  async getGroup(groupKey: string): Promise<Record<string, unknown>> {
    const cacheKey = `settings:group:${groupKey}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const group = await this.prisma.settingGroup.findUnique({
      where:   { key: groupKey },
      include: { settings: { where: { isDeprecated: false }, orderBy: { order: 'asc' } } },
    });
    if (!group) throw new NotFoundException(`Setting group "${groupKey}" not found`);

    const result: Record<string, unknown> = {};
    for (const setting of group.settings) {
      let raw = setting.value || setting.defaultValue || null;
      if (setting.type === 'SECRET' && raw?.startsWith('enc:')) {
        try { raw = this.encryption.decrypt(raw.slice(4)); } catch { raw = null; }
      }
      result[setting.key] = parseSettingValue(raw ?? '', setting.type as SettingType);
    }

    await this.redis.set(cacheKey, JSON.stringify(result), 300);
    return result;
  }

  // ─── WRITE ───────────────────────────────────────────────

  async set(fullKey: string, value: unknown): Promise<void> {
    const setting = await this.prisma.setting.findUnique({ where: { fullKey } });
    if (!setting)          throw new NotFoundException(`Setting "${fullKey}" not found`);
    if (setting.isReadOnly) throw new ForbiddenException(`Setting "${fullKey}" is read-only`);

    let serialized = serializeSettingValue(value);
    if (setting.type === 'SECRET' && serialized) {
      serialized = 'enc:' + this.encryption.encrypt(serialized);
    }

    await this.prisma.setting.update({
      where: { fullKey },
      data:  { value: serialized },
    });

    await this.invalidateCache(fullKey, setting.group?.key);
  }

  async setGroup(groupKey: string, values: Record<string, unknown>): Promise<void> {
    for (const [key, value] of Object.entries(values)) {
      await this.set(`${groupKey}.${key}`, value);
    }
    await this.redis.del(`settings:group:${groupKey}`);
  }

  // ─── CACHE ───────────────────────────────────────────────

  private async invalidateCache(fullKey: string, groupKey?: string): Promise<void> {
    await this.redis.del(`settings:${fullKey}`);
    if (groupKey) await this.redis.del(`settings:group:${groupKey}`);
  }

  // ─── API HELPERS (for controller) ────────────────────────

  async getAllGroupsForApi(isAdmin: boolean): Promise<SettingGroup[]> {
    return this.prisma.settingGroup.findMany({
      where:   isAdmin ? { settings: { some: { isDeprecated: false } } } : { isPublic: true },
      include: {
        settings: {
          where:   { isDeprecated: false },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  maskSecretValues(groups: SettingGroup[]): SettingGroup[] {
    return groups.map((group) => ({
      ...group,
      settings: group.settings.map((s) => ({
        ...s,
        value: s.type === 'SECRET' && s.value ? '••••••••' : s.value,
      })),
    }));
  }
}
```

---

## 9. User Preferences Service

### `user-preferences.service.ts`

```typescript
@Injectable()
export class UserPreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async getForUser(userId: string): Promise<PreferenceGroupWithValues[]> {
    const groups = await this.prisma.userPreferenceGroup.findMany({
      include: {
        preferences: { orderBy: { order: 'asc' } },
      },
      orderBy: { order: 'asc' },
    });

    const userValues = await this.prisma.userPreferenceValue.findMany({
      where: { userId },
    });
    const valueMap = new Map(userValues.map((v) => [v.preferenceId, v.value]));

    return groups.map((group) => ({
      ...group,
      preferences: group.preferences.map((pref) => ({
        ...pref,
        value: valueMap.get(pref.id) ?? pref.defaultValue ?? null,
      })),
    }));
  }

  async getValue(userId: string, fullKey: string): Promise<unknown> {
    const pref = await this.prisma.userPreference.findUnique({ where: { fullKey } });
    if (!pref) throw new NotFoundException(`Preference "${fullKey}" not found`);

    const record = await this.prisma.userPreferenceValue.findUnique({
      where: { userId_preferenceId: { userId, preferenceId: pref.id } },
    });

    const raw = record?.value ?? pref.defaultValue ?? null;
    return parseSettingValue(raw ?? '', pref.type as SettingType);
  }

  async setGroup(userId: string, groupKey: string, values: Record<string, unknown>): Promise<void> {
    const group = await this.prisma.userPreferenceGroup.findUnique({
      where: { key: groupKey },
      include: { preferences: true },
    });
    if (!group) throw new NotFoundException(`Preference group "${groupKey}" not found`);

    for (const pref of group.preferences) {
      if (!(pref.key in values)) continue;

      await this.prisma.userPreferenceValue.upsert({
        where: { userId_preferenceId: { userId, preferenceId: pref.id } },
        create: {
          userId,
          preferenceId: pref.id,
          value: serializeSettingValue(values[pref.key]),
        },
        update: {
          value: serializeSettingValue(values[pref.key]),
        },
      });
    }
  }
}
```

---

## 10. API Endpoints

### System Settings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/settings` | Authenticated | كل الـ groups (admin: كل شيء، user: isPublic فقط) |
| GET | `/api/v1/settings/:groupKey` | Authenticated | Group واحدة |
| PATCH | `/api/v1/settings/:groupKey` | `settings:update` | تحديث قيم group |
| GET | `/api/v1/settings/:groupKey/:settingKey/reveal` | `settings:reveal` | القيمة الحقيقية لـ SECRET (مسجّل في AuditLog) |
| POST | `/api/v1/settings/groups` | `settings:manage` | إنشاء group مخصص |
| POST | `/api/v1/settings/groups/:groupKey/settings` | `settings:manage` | إضافة setting مخصص |
| DELETE | `/api/v1/settings/groups/:groupKey` | `settings:manage` | حذف custom group فقط (isCustom: true) |
| GET | `/api/v1/settings/sync-status` | `settings:read` | حالة الـ sync (deprecated, warnings) |

### User Preferences

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/users/me/preferences` | Authenticated | كل الـ preference groups + قيم المستخدم |
| PATCH | `/api/v1/users/me/preferences/:groupKey` | Authenticated | تحديث preferences لـ group |
| GET | `/api/v1/users/me/preferences/value/:fullKey` | Authenticated | قيمة preference واحدة |

### Response Example — GET /api/v1/settings

```json
{
  "success": true,
  "data": [
    {
      "key": "general",
      "label": "General Settings",
      "icon": "Settings",
      "order": 1,
      "isPublic": true,
      "settings": [
        {
          "key": "app_name",
          "fullKey": "general.app_name",
          "label": "Application Name",
          "description": "Displayed in the browser tab and emails",
          "type": "STRING",
          "value": "My App",
          "defaultValue": "My App",
          "options": null,
          "validation": { "required": true, "min": 2, "max": 100 },
          "isReadOnly": false,
          "isRequired": true,
          "isDeprecated": false,
          "order": 1
        },
        {
          "key": "smtp_password",
          "fullKey": "email_settings.smtp_password",
          "type": "SECRET",
          "value": "••••••••",
          "label": "SMTP Password"
        }
      ]
    }
  ]
}
```

---

## 11. Integration مع باقي الـ Modules

### ⚠️ نقطة مهمة مش موجودة في الـ spec الأصلي

الـ Settings System لازم **تتكامل** مع الـ modules الموجودة من Spec 2-4:

#### AuthService — استخدام Security Settings

```typescript
// في AuthService، بدل قراءة الـ config مباشرة
// كده (قديم):
const ttl = this.config.get<number>('JWT_ACCESS_TTL'); // ثابت في .env

// كده (جديد — قابل للتغيير من الـ UI):
const ttl = await this.settings.getTyped<number>(SecuritySettings.keys.access_token_ttl);
const maxAttempts = await this.settings.getTyped<number>(SecuritySettings.keys.max_login_attempts);
```

#### EmailService — استخدام Email Settings

```typescript
async getTransporter() {
  const config = await this.settings.getGroup('email_settings');
  return nodemailer.createTransporter({
    host:   config.smtp_host as string,
    port:   config.smtp_port as number,
    secure: config.smtp_secure as boolean,
    auth: {
      user: config.smtp_user as string,
      pass: config.smtp_password as string,  // auto-decrypted
    },
  });
}
```

#### FilesService — استخدام Storage Settings

```typescript
async getStorageProvider() {
  const provider = await this.settings.get(StorageSettings.keys.storage_provider);
  const maxSize  = await this.settings.getTyped<number>(StorageSettings.keys.max_file_size_mb);
  return provider === 's3' ? this.s3Service : this.localService;
}
```

#### Maintenance Mode Middleware

```typescript
@Injectable()
export class MaintenanceModeMiddleware implements NestMiddleware {
  constructor(private settings: SettingsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const isMaintenanceOn = await this.settings.getTyped<boolean>(
      GeneralSettings.keys.maintenance_mode
    );
    if (isMaintenanceOn && !req.user?.isAdmin) {
      const message = await this.settings.get(GeneralSettings.keys.maintenance_message);
      return res.status(503).json({ success: false, message });
    }
    next();
  }
}
```

---

## 12. Frontend

### Settings Page Structure

```
/dashboard/settings
│
├── [Left Sidebar — SettingsGroupSidebar.tsx]
│   ├── بيلود الـ groups من API (مش hardcoded)
│   ├── Group icon + label
│   ├── Unsaved changes dot indicator
│   └── "Deprecated" badge
│
└── [Right Panel — SettingsForm.tsx]
    ├── Dynamic field renderer حسب الـ type
    ├── "Save Changes" button
    ├── "Reset to Defaults" button  
    └── Block navigation if unsaved (React Router useBlocker)
```

### Field Components — Render Map

```tsx
// SettingsForm.tsx
function renderField(setting: SettingDefinition) {
  const props = { key: setting.key, setting, value, onChange };

  switch (setting.type) {
    case 'STRING':  return <StringField  {...props} />;
    case 'NUMBER':  return <NumberField  {...props} />;
    case 'BOOLEAN': return <BooleanField {...props} />;
    case 'SELECT':  return <SelectField  {...props} />;
    case 'JSON':    return <JsonField    {...props} />;
    case 'SECRET':  return <SecretField  {...props} />;
  }
}
```

### Field Specs

| Type | Component | UI Elements |
|------|-----------|-------------|
| STRING | StringField | `<Input>` + char counter إذا في max |
| NUMBER | NumberField | `<Input type="number">` + min/max من validation |
| BOOLEAN | BooleanField | `<Switch>` + label + description |
| SELECT | SelectField | `<Select>` + options من الـ API |
| JSON | JsonField | `<Textarea>` + validate button + pretty-print + error highlight |
| SECRET | SecretField | `<Input type="password">` + 👁 toggle + 🔒 badge + "Reveal" button |

### PreferencesContext

```tsx
// contexts/PreferencesContext.tsx
// بيحمل user preferences في الـ global state
// وبيطبق التغييرات فوراً على الـ UI

const { preferences, setPreference } = usePreferences();

// Theme — فوري بدون reload
setPreference('appearance.theme', 'dark');
// → document.documentElement.setAttribute('data-theme', 'dark')

// Items per page — يتحفظ في React Query defaults
setPreference('appearance.items_per_page', '25');
```

---

## 13. الـ Spec Prompt الكامل

```
/speckit.specify Build a production-grade Schema-Based Dynamic Settings System for the NestJS Scaffolding Dashboard.

═══════════════════════════════════════════════════════
CORE PHILOSOPHY
═══════════════════════════════════════════════════════

Pattern: Schema-as-Source-of-Truth (inspired by Terraform/Kubernetes)

- Schema files (TypeScript) → define STRUCTURE: keys, types, labels, validations
- Database (PostgreSQL) → store VALUES only: what admin configured
- Sync Engine → runs on every app startup, reconciles schema vs DB safely
- Redis → caches values for fast runtime reads

THE GOLDEN RULE:
  Schema  = controls what settings EXIST
  Database = controls what settings are SET TO
  Sync Engine = NEVER touches existing values, only adds missing ones

═══════════════════════════════════════════════════════
LAYER 1 — SYSTEM SETTINGS
═══════════════════════════════════════════════════════

FOLDER STRUCTURE:
src/modules/settings/
├── schema/
│   ├── groups/
│   │   ├── general.schema.ts
│   │   ├── email.schema.ts
│   │   ├── security.schema.ts
│   │   ├── storage.schema.ts
│   │   └── notifications.schema.ts
│   └── index.ts                    (ALL_SETTING_GROUPS array)
├── settings.schema.ts              (defineSettingGroup() helper + types)
├── settings-sync.service.ts        (startup sync engine — OnModuleInit)
├── settings.service.ts             (runtime get/set/cache)
├── settings.controller.ts
├── settings.module.ts
└── dto/

CORE TYPES (settings.schema.ts):
- SettingType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'JSON' | 'SECRET'
- SettingDefinition<T>: type, label, description?, defaultValue (typed), options? (SELECT only), validation?, isReadOnly?, isPublic?, order
- SettingGroupSchema<T>: key, label, description?, icon?, order, isPublic?, settings
- defineSettingGroup<T>(schema): returns schema + .keys object for type-safe access
- serializeSettingValue(value): converts any value to string for DB storage
- parseSettingValue(raw, type): converts string back to correct TypeScript type

PRISMA MODELS:
SettingGroup: id(UUID), key(unique), label, description?, icon?, order, isPublic(bool), settings[], createdAt, updatedAt
Setting: id(UUID), groupId, key, fullKey(unique — "group.key"), label, description?, type(SettingType), value(string), defaultValue?, options(JSON?), validation(JSON?), isRequired, isReadOnly, isPublic, isDeprecated, isCustom, order, createdAt, updatedAt
  @@unique([groupId, key])

SETTING GROUP SCHEMAS (implement all 5):

1. general.schema.ts (order:1, isPublic:true):
   app_name(STRING, required), app_url(STRING, required, url pattern), app_logo_url(STRING?),
   support_email(STRING, email pattern), maintenance_mode(BOOLEAN, default:false),
   maintenance_message(STRING)

2. email.schema.ts (order:2):
   smtp_host(STRING, required), smtp_port(NUMBER, 1-65535, default:587), smtp_secure(BOOLEAN),
   smtp_user(STRING), smtp_password(SECRET), smtp_from_name(STRING), smtp_from_email(STRING, email pattern)

3. security.schema.ts (order:3):
   access_token_ttl(NUMBER, 60-86400, default:900), refresh_token_ttl(NUMBER, min:3600, default:604800),
   max_login_attempts(NUMBER, 1-20, default:5), lockout_duration(NUMBER, default:900),
   password_min_length(NUMBER, 6-128, default:8), require_uppercase(BOOLEAN, default:true),
   require_number(BOOLEAN, default:true), require_special_char(BOOLEAN, default:true),
   require_email_verification(BOOLEAN, default:true), allowed_origins(JSON, default:[])

4. storage.schema.ts (order:4):
   storage_provider(SELECT: local/s3/r2, default:local), max_file_size_mb(NUMBER, 1-500, default:10),
   allowed_mime_types(JSON), s3_endpoint(STRING?), s3_bucket(STRING?),
   s3_region(SELECT: common regions), s3_access_key(SECRET?), s3_secret_key(SECRET?), s3_public_base_url(STRING?)

5. notifications.schema.ts (order:5):
   enable_email_notifications(BOOLEAN, default:true), notify_admin_on_new_user(BOOLEAN, default:true),
   notify_user_on_login(BOOLEAN, default:false), notify_user_on_password_change(BOOLEAN, default:true),
   admin_notification_email(STRING?)

SYNC ENGINE (settings-sync.service.ts — OnModuleInit):
Rules:
- Group NEW → CREATE (never throw if fails — log error and continue)
- Group EXISTS → UPDATE label/icon/description/order/isPublic only
- Setting NEW → CREATE with defaultValue
- Setting EXISTS → UPDATE label/description/options/validation/order/isRequired/isDeprecated=false only
- Setting REMOVED from schema → SET isDeprecated=true (NEVER DELETE)
- Type mismatch → LOG WARNING only, never auto-migrate
- isCustom=true settings → never touch them (user-created via API)
- NEVER update: value, defaultValue, type, fullKey

ENCRYPTION SERVICE (src/common/services/encryption.service.ts):
- Algorithm: AES-256-GCM
- Key from: SETTINGS_ENCRYPTION_KEY env var (must be 64 hex chars = 32 bytes)
- Format stored in DB: "enc:{iv_hex}{authTag_hex}{ciphertext_hex}"
- Methods: encrypt(plaintext): string, decrypt(ciphertext): string
- Throws on init if key is missing or invalid length

SETTINGS SERVICE (settings.service.ts):
Methods:
- get(fullKey): Promise<string|null> — checks Redis first (TTL:300s), auto-decrypts SECRET, caches result
- getTyped<T>(fullKey): Promise<T|null> — calls get() then parseSettingValue()
- getGroup(groupKey): Promise<Record<string,unknown>> — all values in group, cached as group-level key
- set(fullKey, value): Promise<void> — validates not readOnly, encrypts if SECRET, updates DB, invalidates cache
- setGroup(groupKey, values): Promise<void> — calls set() for each key
- getAllGroupsForApi(isAdmin): returns groups filtered by isPublic for non-admins
- maskSecretValues(groups): replaces SECRET values with "••••••••"

API ENDPOINTS:
GET    /api/v1/settings                              (Authenticated: admin=all, user=isPublic only)
GET    /api/v1/settings/sync-status                  (Permission: settings:read)
GET    /api/v1/settings/:groupKey                    (Authenticated)
PATCH  /api/v1/settings/:groupKey                    (Permission: settings:update — validates types + rules)
GET    /api/v1/settings/:groupKey/:settingKey/reveal (Permission: settings:reveal — logged in AuditLog)
POST   /api/v1/settings/groups                       (Permission: settings:manage — isCustom:true)
POST   /api/v1/settings/groups/:groupKey/settings    (Permission: settings:manage — isCustom:true)
DELETE /api/v1/settings/groups/:groupKey             (Permission: settings:manage — only if isCustom:true)

INTEGRATION WITH EXISTING MODULES:
- AuthService: reads access_token_ttl, refresh_token_ttl, max_login_attempts, lockout_duration from settings instead of env vars
- EmailService: reads full SMTP config from settings (smtp_host, port, etc.) — transporter created dynamically on each send
- FilesService: reads storage_provider and max_file_size_mb from settings
- Add MaintenanceModeMiddleware: checks general.maintenance_mode before every request, returns 503 to non-admins if enabled

NEW PERMISSIONS (add to Spec 3 seed):
settings:read, settings:update, settings:reveal, settings:manage
Assign to admin role: settings:read, settings:update, settings:reveal

NEW ENV VARIABLE:
SETTINGS_ENCRYPTION_KEY — 64 hex chars, generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

═══════════════════════════════════════════════════════
LAYER 2 — USER PREFERENCES
═══════════════════════════════════════════════════════

PRISMA MODELS:
UserPreferenceGroup: id, key(unique), label, description?, icon?, order, preferences[]
UserPreference: id, groupId, key, fullKey(unique), label, description?, type(SettingType — no SECRET), defaultValue?, options?, order
UserPreferenceValue: id, userId, preferenceId, value(string), @@unique([userId, preferenceId])
Add to User model: preferenceValues UserPreferenceValue[]

PREFERENCE GROUP SCHEMAS:

1. appearance.schema.ts (order:1):
   theme(SELECT: light/dark/system, default:system), language(SELECT: en/ar/fr, default:en),
   sidebar_collapsed(BOOLEAN, default:false), items_per_page(SELECT: 10/25/50/100, default:'10'),
   date_format(SELECT: MMM DD YYYY / DD/MM/YYYY / YYYY-MM-DD, default:'MMM DD, YYYY')

2. notifications.schema.ts (order:2):
   email_alerts(BOOLEAN, default:true), browser_notifications(BOOLEAN, default:false),
   alert_on_login(BOOLEAN, default:false)

3. dashboard.schema.ts (order:3):
   default_view(SELECT: list/grid, default:list), show_welcome_message(BOOLEAN, default:true)

USER PREFERENCES SERVICE:
- getForUser(userId): returns all groups with user values merged in (fallback to defaultValue)
- getValue(userId, fullKey): single preference with correct type parsing
- setGroup(userId, groupKey, values): upserts UserPreferenceValue records

SYNC ENGINE (user-preferences-sync.service.ts — same pattern as settings sync)

API:
GET   /api/v1/users/me/preferences
PATCH /api/v1/users/me/preferences/:groupKey
GET   /api/v1/users/me/preferences/value/:fullKey

═══════════════════════════════════════════════════════
FRONTEND
═══════════════════════════════════════════════════════

SETTINGS PAGE (/dashboard/settings — admin only, permission: settings:read):
Layout: two-column — left sidebar (groups) + right panel (form)

Sidebar (SettingsGroupSidebar.tsx):
- Groups loaded from API on mount
- Each item: icon + label
- Active group highlighted
- Unsaved changes indicator: orange dot on group name
- "Deprecated" badge on deprecated groups

Form (SettingsForm.tsx — dynamic, zero hardcoding):
- Iterates over settings in selected group
- Renders correct field component based on type
- Each field wrapper shows: label (bold), description (muted), required indicator, deprecated warning
- "Save Changes" button (saves entire group)
- "Reset to Defaults" (confirmation dialog required)
- useBlocker() to prevent navigation with unsaved changes

Field components (6 total — all in fields/ folder):
- StringField: Input + char counter if max defined
- NumberField: Input[type=number] + min/max from validation
- BooleanField: Switch + label on right + description below
- SelectField: Select dropdown with options from API response
- JsonField: Textarea + "Validate JSON" button + "Pretty Print" button + red border if invalid
- SecretField: Input[type=password] + eye toggle + "Encrypted" badge + "Reveal" button (calls /reveal API, shows value in modal)

USER PREFERENCES (tab in /dashboard/profile):
- Reuses same field components (StringField, NumberField, etc.)
- Loads from /api/v1/users/me/preferences
- Saves to /api/v1/users/me/preferences/:groupKey
- No SecretField (user preferences don't support SECRET type)

PREFERENCES CONTEXT (contexts/PreferencesContext.tsx):
- Loads user preferences on auth
- Exposes: preferences object + setPreference(fullKey, value) function
- Theme change → immediately updates document.documentElement[data-theme]
- Language change → immediately updates i18n locale
- Sidebar collapse → immediately updates layout
- All changes also saved to API (optimistic update)
```

---

## 14. Plan + Tasks + Implement

### أمر الـ Plan:

```
/speckit.plan Same core tech stack (NestJS 10, Prisma 5, Redis, React 18).

No new packages needed:
- Backend: built-in Node.js 'crypto' module for AES-256-GCM (zero dependencies)
- Frontend: no new packages — uses existing shadcn/ui (Input, Switch, Select, Textarea, Badge, Tabs, Dialog)

Integration notes:
- EncryptionService goes in src/common/services/ and is exported from CommonModule
- SettingsModule is imported in AppModule early (before AuthModule) since AuthService depends on it
- MaintenanceModeMiddleware applied in AppModule.configure() for all routes
- PreferencesContext wraps the app inside AuthContext
```

### أمر الـ Tasks:

```
/speckit.tasks
```

### أمر الـ Implement:

```
/speckit.implement
```

---

## 15. Acceptance Criteria

### Sync Engine
- [ ] عند الـ startup، settings جديدة في الـ schema بتتضاف للـ DB بالـ defaultValue
- [ ] Settings موجودة في الـ DB — قيمها مش بتتغير بعد sync
- [ ] Setting اتحذف من الـ schema → `isDeprecated: true` في الـ DB (مش حذف)
- [ ] Type mismatch → warning في الـ logs فقط، مش exception
- [ ] Sync failure → لا يوقف الـ app (catch + log)
- [ ] `isCustom: true` settings → الـ sync مش بيمسهم

### Encryption
- [ ] SECRET values بتتخزن كـ `enc:{...}` في الـ DB
- [ ] نفس القيمة بعد encrypt → decrypt بترجع بالظبط
- [ ] App لا تبدأ لو `SETTINGS_ENCRYPTION_KEY` مش موجود أو طوله غلط
- [ ] تغيير الـ key في البيئة → decrypt بيفشل gracefully (return null)

### Settings Service
- [ ] `get(EmailSettings.keys.smtp_host)` يرجع القيمة الصح
- [ ] `getTyped<number>(SecuritySettings.keys.access_token_ttl)` يرجع number مش string
- [ ] Cache يشتغل: call ثانية من Redis مش DB (تحقق بـ Prisma query logs)
- [ ] Cache يتمسح بعد `set()`
- [ ] `get()` على SECRET يرجع decrypted تلقائياً
- [ ] `set()` على readOnly يرمي ForbiddenException

### API
- [ ] `GET /api/v1/settings` — admin يشوف كل الـ groups
- [ ] `GET /api/v1/settings` — non-admin يشوف isPublic groups بس (403 للباقي)
- [ ] SECRET fields في الـ GET response → `"••••••••"`
- [ ] `/reveal` endpoint → يرجع القيمة الحقيقية + يسجل في AuditLog
- [ ] `PATCH /api/v1/settings/general` → يحفظ + يمسح cache + يرجع updated group
- [ ] Validation شغال: NUMBER out of range → 400 بـ error واضح
- [ ] إضافة custom group بـ POST → بيظهر في الـ GET فوراً
- [ ] حذف custom group بـ DELETE → شغال، لكن system groups محمية

### Integration
- [ ] AuthService بيقرأ `access_token_ttl` من settings (مش hardcoded)
- [ ] EmailService بيبني الـ transporter من email settings ديناميكياً
- [ ] `maintenance_mode = true` → non-admin بيرجع 503
- [ ] تغيير `max_login_attempts` من الـ UI بيأثر فوراً على الـ auth behavior

### User Preferences
- [ ] `PATCH /api/v1/users/me/preferences/appearance` بيحفظ theme للـ user
- [ ] يوزر تاني بيلود preferences مختلفة
- [ ] Reset preferences → بيرجع للـ defaultValues

### Frontend
- [ ] Settings sidebar بيلود الـ groups من الـ API (مش hardcoded)
- [ ] كل الـ 6 field types بتتrender صح
- [ ] JsonField بيظهر error عند JSON غلط
- [ ] SecretField بيظهر "Encrypted" badge وزرار Reveal
- [ ] Reveal بيفتح modal بالقيمة الحقيقية
- [ ] Unsaved changes dot بيظهر على اسم الـ group في الـ sidebar
- [ ] Navigation blocked إذا في unsaved changes (confirmation dialog)
- [ ] Theme preference بتتطبق فوراً من غير reload
- [ ] Sidebar collapse preference بتتطبق فوراً

### Milestones Check
```
v1.1.0 ← بعد Spec 7:
  ✅ settings sync شغال عند startup
  ✅ admin يقدر يعدل email + security settings من الـ UI
  ✅ SECRET values مشفرة في الـ DB
  ✅ user preferences (theme/language) بتتطبق فوراً
  ✅ maintenance mode شغال
```