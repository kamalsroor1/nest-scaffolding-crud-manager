# ⚙️ Settings System — Documentation

> **المشروع:** NestJS Scaffolding Dashboard
> **النظام:** Schema-Based Dynamic Settings
> **المبدأ:** Schema controls structure. Database controls values. Sync engine bridges the gap.

---

## 📖 نظرة عامة

نظام الـ Settings مكوّن من طبقتين منفصلتين تماماً:

| الطبقة | الاسم | من يتحكم فيها | أين تتخزن |
|--------|-------|---------------|-----------|
| 1 | **System Settings** | Admin فقط | Database + Redis Cache |
| 2 | **User Preferences** | كل user لنفسه | Database (per-user) |

---

## 🏗️ المعمارية

```
┌─────────────────────────────────────────────────────────────┐
│                    Schema Files (TypeScript)                  │
│   general.schema.ts │ email.schema.ts │ security.schema.ts   │
│                      └──── index.ts ────┘                    │
│                    ↓ (on app startup)                        │
├─────────────────────────────────────────────────────────────┤
│                    Sync Engine                                │
│   - Creates missing settings with defaultValue               │
│   - Updates metadata (label, description, order)             │
│   - NEVER touches existing values                            │
│   - Deprecates removed settings (soft, never deletes)        │
│                    ↓                                         │
├─────────────────────────────────────────────────────────────┤
│              Database (PostgreSQL via Prisma)                 │
│   SettingGroup │ Setting │ UserPreference │ UserPrefValue    │
│                    ↕ (read/write)                            │
├─────────────────────────────────────────────────────────────┤
│                  Redis Cache (5 min TTL)                     │
│   Key format: "settings:{groupKey}.{settingKey}"             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 هيكل الملفات

```
src/modules/settings/
├── schema/
│   ├── groups/
│   │   ├── general.schema.ts        ← App name, URL, maintenance mode
│   │   ├── email.schema.ts          ← SMTP configuration
│   │   ├── security.schema.ts       ← Tokens, login attempts, CORS
│   │   ├── storage.schema.ts        ← Local vs S3, file size limits
│   │   └── notifications.schema.ts  ← Email notification toggles
│   └── index.ts                     ← ALL_SETTING_GROUPS array
├── settings.schema.ts               ← defineSettingGroup() + types
├── settings-sync.service.ts         ← Startup reconciliation engine
├── settings.service.ts              ← get/set/getTyped/getGroup
├── settings.controller.ts           ← REST endpoints
├── settings.module.ts
└── dto/
    ├── update-group.dto.ts
    ├── create-group.dto.ts
    └── create-setting.dto.ts

src/modules/user-preferences/
├── schema/
│   ├── groups/
│   │   ├── appearance.schema.ts     ← Theme, language, sidebar
│   │   ├── notifications.schema.ts  ← Email/browser alert toggles
│   │   └── dashboard.schema.ts      ← Default view, welcome message
│   └── index.ts
├── user-preferences.schema.ts
├── user-preferences-sync.service.ts
├── user-preferences.service.ts
└── user-preferences.controller.ts
```

---

## 🗃️ قاعدة البيانات

### جدول `SettingGroup`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| key | String (unique) | snake_case identifier, e.g. `email_settings` |
| label | String | Display name |
| description | String? | Optional description |
| icon | String? | Lucide icon name, e.g. `Mail` |
| order | Int | Display order in sidebar |
| isPublic | Boolean | If true, authenticated non-admins can READ |

### جدول `Setting`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| groupId | UUID | FK → SettingGroup |
| key | String | snake_case, unique within group |
| fullKey | String (unique) | `{groupKey}.{key}`, e.g. `email_settings.smtp_host` |
| label | String | Display name |
| description | String? | Help text shown in UI |
| type | Enum | STRING \| NUMBER \| BOOLEAN \| SELECT \| JSON \| SECRET |
| value | String | Current value (always stored as string) |
| defaultValue | String? | Fallback value from schema |
| options | JSON? | For SELECT type: `[{label, value}]` |
| validation | JSON? | `{required?, min?, max?, pattern?}` |
| isReadOnly | Boolean | Show in UI but cannot edit |
| isPublic | Boolean | Non-admins can read this specific setting |
| isDeprecated | Boolean | Removed from schema but kept in DB |
| isCustom | Boolean | Created via API (not from schema file) |
| order | Int | Display order within group |

### جدول `UserPreferenceValue`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | FK → User |
| preferenceId | UUID | FK → UserPreference |
| value | String | User's chosen value |
| @@unique | [userId, preferenceId] | One value per user per preference |

---

## 🔑 Setting Types

### STRING
```typescript
app_name: {
  type: 'STRING',
  label: 'Application Name',
  defaultValue: 'My App',
  validation: { required: true, min: 2, max: 100 },
}
// UI: <Input type="text" />
// Stored: raw string
```

### NUMBER
```typescript
smtp_port: {
  type: 'NUMBER',
  label: 'SMTP Port',
  defaultValue: 587,
  validation: { required: true, min: 1, max: 65535 },
}
// UI: <Input type="number" />
// Stored: "587" → parsed to 587 on read
```

### BOOLEAN
```typescript
maintenance_mode: {
  type: 'BOOLEAN',
  label: 'Maintenance Mode',
  defaultValue: false,
}
// UI: <Switch />
// Stored: "true" / "false" → parsed to boolean on read
```

### SELECT
```typescript
storage_provider: {
  type: 'SELECT',
  label: 'Storage Provider',
  defaultValue: 'local',
  options: [
    { label: 'Local Disk', value: 'local' },
    { label: 'Amazon S3', value: 's3' },
  ],
}
// UI: <Select> dropdown
// Stored: "local" / "s3"
```

### JSON
```typescript
allowed_origins: {
  type: 'JSON',
  label: 'Allowed CORS Origins',
  defaultValue: [],
  description: 'Array of allowed origins. Example: ["https://myapp.com"]',
}
// UI: <Textarea /> with JSON validator + pretty-print button
// Stored: JSON.stringify(value) → JSON.parse() on read
```

### SECRET
```typescript
smtp_password: {
  type: 'SECRET',
  label: 'SMTP Password',
  defaultValue: '',
}
// UI: <Input type="password" /> + show/hide toggle + "Encrypted" badge
// Stored: "enc:{AES-256-GCM encrypted value}"
// API response: "••••••••" (masked)
// Internal use: auto-decrypted by SettingsService
```

---

## 🔄 Sync Engine — كيف يعمل

يشتغل **مرة واحدة عند كل startup** (`OnModuleInit`). آمن تماماً في الـ production.

### قواعد الـ Sync

```
Setting موجودة في Schema فقط (جديدة):
  → INSERT بالـ defaultValue
  → لا تمس أي values موجودة

Setting موجودة في الـ DB والـ Schema:
  → UPDATE: label, description, options, validation, order فقط
  → NEVER UPDATE: value (القيمة اللي Admin حددها مقدسة)

Setting موجودة في الـ DB فقط (اتحذفت من Schema):
  → SET isDeprecated = true
  → لا تحذف البيانات (يمكن رجوع الـ setting)

Type مختلف بين Schema والـ DB:
  → LOG warning بس
  → لا تعدل تلقائياً (خطر على البيانات)

Setting isCustom: true (اتعملت عن طريق API):
  → لا تمسها خالص — مش في الـ schema
```

### مثال على Sync Log

```
[Settings Sync] Starting...
[Settings Sync] Group "general": synced (5 settings, 0 new)
[Settings Sync] Group "email_settings": synced (7 settings, 0 new)
[Settings Sync] Group "payment_settings": synced (3 settings, 3 NEW) ← group جديد
[Settings Sync] Deprecated: "old_group.old_key" (removed from schema)
[Settings Sync] WARN: Type mismatch "security_settings.max_attempts": DB=STRING, Schema=NUMBER
[Settings Sync] Complete in 124ms
```

---

## 🚀 استخدام الـ SettingsService في الكود

### الطريقة الأساسية (type-safe)

```typescript
import { EmailSettings, SecuritySettings } from '../settings/schema';

@Injectable()
export class EmailService {
  constructor(private settings: SettingsService) {}

  async getSmtpConfig() {
    return {
      host:     await this.settings.get(EmailSettings.keys.smtp_host),
      port:     await this.settings.getTyped<number>(EmailSettings.keys.smtp_port),
      secure:   await this.settings.getTyped<boolean>(EmailSettings.keys.smtp_secure),
      user:     await this.settings.get(EmailSettings.keys.smtp_user),
      password: await this.settings.get(EmailSettings.keys.smtp_password), // auto-decrypted
    };
  }
}
```

### الطريقة البديلة (string keys — أقل أماناً)

```typescript
const appName = await this.settings.get('general.app_name');
const maxAttempts = await this.settings.getTyped<number>('security_settings.max_login_attempts');
```

### جلب group كامل

```typescript
const emailConfig = await this.settings.getGroup('email_settings');
// Returns: { smtp_host: "smtp.gmail.com", smtp_port: 587, smtp_secure: false, ... }
```

### تعديل قيمة (من الكود)

```typescript
await this.settings.set('general.maintenance_mode', true);
await this.settings.set(SecuritySettings.keys.max_login_attempts, 3);
```

---

## 🌐 API Endpoints

### System Settings

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/v1/settings` | Authenticated | All groups (admin: all, user: public only) |
| GET | `/api/v1/settings/:groupKey` | Authenticated | Single group |
| PATCH | `/api/v1/settings/:groupKey` | `settings:update` | Update group values |
| GET | `/api/v1/settings/:groupKey/:key/reveal` | `settings:reveal` | Decrypt SECRET value (logged) |
| POST | `/api/v1/settings/groups` | `settings:manage` | Create custom group |
| POST | `/api/v1/settings/groups/:groupKey/settings` | `settings:manage` | Add custom setting |
| GET | `/api/v1/settings/sync-status` | `settings:read` | View deprecated/warning settings |

### Response Format — GET /api/v1/settings

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

### PATCH /api/v1/settings/:groupKey

```json
// Request
PATCH /api/v1/settings/general
{
  "app_name": "My New App Name",
  "maintenance_mode": true,
  "maintenance_message": "Back in 30 minutes"
}

// Response
{
  "success": true,
  "message": "Settings updated successfully",
  "data": { ...updated group... }
}
```

### User Preferences

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/v1/users/me/preferences` | Authenticated | All pref groups + current values |
| PATCH | `/api/v1/users/me/preferences/:groupKey` | Authenticated | Update user's preferences |
| GET | `/api/v1/users/me/preferences/value/:fullKey` | Authenticated | Single preference value |

---

## ➕ إضافة Settings جديدة

### حالة 1: Setting جديد في group موجود

```typescript
// email.schema.ts — أضف الـ setting الجديد
export const EmailSettings = defineSettingGroup({
  key: 'email_settings',
  settings: {
    // ... existing settings ...
    
    reply_to_email: {           // ← أضف هنا
      type: 'STRING',
      label: 'Reply-To Email',
      description: 'Email address for replies',
      defaultValue: '',
      order: 8,
    },
  },
});
```

**النتيجة:** بعد الـ deploy التالي، الـ sync engine بيضيف `email_settings.reply_to_email` بالـ defaultValue تلقائياً. بيظهر في الـ UI فوراً.

---

### حالة 2: Group جديد كامل

```typescript
// 1. إنشاء ملف جديد: src/modules/settings/schema/groups/payment.schema.ts

import { defineSettingGroup } from '../../settings.schema';

export const PaymentSettings = defineSettingGroup({
  key: 'payment_settings',
  label: 'Payment Configuration',
  icon: 'CreditCard',
  order: 6,
  settings: {
    stripe_public_key: {
      type: 'STRING',
      label: 'Stripe Public Key',
      defaultValue: '',
      order: 1,
    },
    stripe_secret_key: {
      type: 'SECRET',
      label: 'Stripe Secret Key',
      defaultValue: '',
      order: 2,
    },
    currency: {
      type: 'SELECT',
      label: 'Default Currency',
      defaultValue: 'usd',
      options: [
        { label: 'USD', value: 'usd' },
        { label: 'EUR', value: 'eur' },
        { label: 'EGP', value: 'egp' },
      ],
      order: 3,
    },
    enable_payments: {
      type: 'BOOLEAN',
      label: 'Enable Payments',
      defaultValue: false,
      order: 4,
    },
  },
});
```

```typescript
// 2. أضفه لـ schema/index.ts
import { PaymentSettings } from './groups/payment.schema';

export const ALL_SETTING_GROUPS = [
  GeneralSettings,
  EmailSettings,
  SecuritySettings,
  StorageSettings,
  NotificationSettings,
  PaymentSettings,    // ← أضف هنا
];

export { PaymentSettings };  // ← أضف للـ re-exports
```

```typescript
// 3. استخدمه في أي service
import { PaymentSettings } from '../settings/schema';

const stripeKey = await this.settings.get(PaymentSettings.keys.stripe_secret_key);
const currency = await this.settings.getTyped<string>(PaymentSettings.keys.currency);
```

**النتيجة:** بعد الـ deploy، group جديد بيظهر في الـ `/dashboard/settings` sidebar تلقائياً.

---

### حالة 3: Custom group عن طريق API (بدون deploy)

```bash
# إنشاء group
POST /api/v1/settings/groups
Authorization: Bearer {admin-token}
{
  "key": "analytics_settings",
  "label": "Analytics",
  "icon": "BarChart",
  "order": 7
}

# إضافة setting
POST /api/v1/settings/groups/analytics_settings/settings
{
  "key": "google_analytics_id",
  "label": "Google Analytics ID",
  "type": "STRING",
  "defaultValue": "",
  "order": 1
}
```

**ملاحظة:** هذه الـ settings (`isCustom: true`) لا يتحكم فيها الـ sync engine — تبقى في الـ DB حتى لو حُذفت يدوياً.

---

## 🔐 الأمان

### تشفير الـ SECRET Values

```
plaintext → AES-256-GCM → "enc:{base64-ciphertext}"

stored in DB:  "enc:a1b2c3d4..."
API response:  "••••••••"
Internal use:  "myactualpassword" (auto-decrypted by SettingsService)
```

**الـ env variable المطلوبة:**
```bash
# Generate with:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

SETTINGS_ENCRYPTION_KEY=a1b2c3d4e5f6...  # 64 hex chars
```

### الـ Reveal Endpoint

لما Admin يحتاج يشوف قيمة SECRET:

```
GET /api/v1/settings/email_settings/smtp_password/reveal

→ يرجع القيمة الحقيقية المفككة
→ بيتسجل في AuditLog: { action: REVEAL_SECRET, resource: "Setting", resourceId: "...", userId: "..." }
→ يحتاج permission: settings:reveal
```

### الـ Permissions

| Permission | من يمتلكها | ماذا تتيح |
|------------|------------|-----------|
| `settings:read` | admin | قراءة كل الـ settings |
| `settings:update` | admin | تعديل قيم الـ settings |
| `settings:reveal` | admin | رؤية قيم SECRET مفككة |
| `settings:manage` | super-admin | إنشاء groups وkeys جديدة |

---

## 🖥️ الـ Frontend — Settings Page

### هيكل الـ Page

```
/dashboard/settings
│
├── [Left Sidebar]
│   ├── ⚙️ General Settings         ← isPublic, أول في الـ order
│   ├── 📧 Email Configuration
│   ├── 🛡️ Security
│   ├── 💾 File Storage
│   ├── 🔔 Notifications
│   └── + [Custom groups من API]    ← بيظهروا تلقائياً
│
└── [Right Panel — Dynamic Form]
    ├── Group Title + Description
    ├── [Field 1] — STRING → Input
    ├── [Field 2] — BOOLEAN → Switch
    ├── [Field 3] — SELECT → Dropdown
    ├── [Field 4] — SECRET → Password input + Reveal button
    ├── [Field 5] — JSON → Textarea + Validate button
    └── [Save Changes] [Reset to Defaults]
```

### الـ Field Components

```
SettingsForm.tsx
└── renders each setting.type:

STRING  → StringField.tsx   → <Input type="text" maxLength={validation.max} />
NUMBER  → NumberField.tsx   → <Input type="number" min={} max={} />
BOOLEAN → BooleanField.tsx  → <Switch /> + label + description
SELECT  → SelectField.tsx   → <Select> with options from API
JSON    → JsonField.tsx     → <Textarea> + isValid indicator + pretty-print
SECRET  → SecretField.tsx   → <Input type="password"> + 👁 toggle + 🔒 badge
                             + "Reveal" button → calls /reveal endpoint
```

### UX Features

- **Unsaved changes indicator:** نقطة حمراء على اسم الـ group في الـ sidebar
- **Block navigation:** لو في changes غير محفوظة، بيسأل قبل ما تروح
- **Reset to defaults:** Confirmation dialog قبل الـ reset
- **Deprecated settings:** بيظهروا باللون الرمادي مع badge "Deprecated"
- **Read-only settings:** بيظهروا greyed out مع tooltip "This setting is managed by the system"

---

## 👤 User Preferences

### الـ Groups الافتراضية

**Appearance:**
| Key | Type | Default | Options |
|-----|------|---------|---------|
| theme | SELECT | system | light, dark, system |
| language | SELECT | en | en, ar, fr |
| sidebar_collapsed | BOOLEAN | false | — |
| items_per_page | SELECT | 10 | 10, 25, 50, 100 |

**Notifications:**
| Key | Type | Default |
|-----|------|---------|
| email_alerts | BOOLEAN | true |
| browser_notifications | BOOLEAN | false |
| alert_on_login | BOOLEAN | false |

**Dashboard:**
| Key | Type | Default | Options |
|-----|------|---------|---------|
| default_view | SELECT | list | grid, list |
| show_welcome_message | BOOLEAN | true | — |

### كيف تعمل الـ Real-time Preferences

```typescript
// ThemeContext.tsx — بيراقب preference.appearance.theme
const { data: prefs } = useQuery(['preferences', 'appearance'], fetchPreferences);

useEffect(() => {
  const theme = prefs?.theme ?? 'system';
  document.documentElement.setAttribute('data-theme', theme);
}, [prefs?.theme]);

// لما اليوزر يغير الـ theme:
// 1. PATCH /api/v1/users/me/preferences/appearance { theme: "dark" }
// 2. React Query cache تتحدث
// 3. useEffect بيشتغل
// 4. document.documentElement attribute بيتغير
// 5. Tailwind dark mode بيتفعل فوراً — بدون reload
```

---

## 🔍 Sync Status Endpoint

```
GET /api/v1/settings/sync-status

Response:
{
  "deprecatedSettings": [
    { "fullKey": "old_group.old_key", "deprecatedAt": "2024-03-01" }
  ],
  "typeWarnings": [
    {
      "fullKey": "security_settings.max_attempts",
      "dbType": "STRING",
      "schemaType": "NUMBER",
      "message": "Manual migration required"
    }
  ],
  "customSettings": [
    { "fullKey": "analytics_settings.google_id", "isCustom": true }
  ],
  "lastSyncAt": "2024-04-10T10:30:00Z",
  "syncDurationMs": 124
}
```

مفيد لـ:
- Monitoring dashboards
- Post-deploy health checks
- Detecting configuration drift

---

## ⚡ Quick Reference

```typescript
// جلب قيمة واحدة
await settings.get('general.app_name')                          // → string | null
await settings.getTyped<number>('security_settings.smtp_port')  // → number
await settings.getTyped<boolean>('general.maintenance_mode')    // → boolean
await settings.getTyped<string[]>('storage_settings.allowed_mime_types') // → string[]

// Type-safe (موصى به)
await settings.get(EmailSettings.keys.smtp_host)
await settings.getTyped<number>(SecuritySettings.keys.access_token_ttl)

// جلب group كامل
await settings.getGroup('email_settings')  // → { smtp_host: "...", smtp_port: 587, ... }

// تعديل
await settings.set('general.app_name', 'New App Name')
await settings.set(SecuritySettings.keys.max_login_attempts, 3)
await settings.setGroup('email_settings', { smtp_host: 'smtp.gmail.com', smtp_port: 587 })
```

---

## 🚨 أخطاء شائعة

| المشكلة | السبب | الحل |
|---------|-------|------|
| Setting مش بيتحدث في الـ production | الـ sync engine شغال بس القيمة في الـ cache | الـ cache بيتمسح تلقائياً بعد الـ PATCH — تأكد من الـ Redis connection |
| SECRET value فاضي بعد deploy | `SETTINGS_ENCRYPTION_KEY` اتغير | لا تغير الـ key أبداً — هتخسر كل الـ encrypted values |
| Setting جديد مظهرش في الـ UI | نسيت تضيفه لـ `ALL_SETTING_GROUPS` في `index.ts` | أضفه للـ array وإعد الـ deploy |
| Type mismatch warning في الـ logs | غيرت الـ type في الـ schema لـ setting موجود | اعمل manual data migration ثم غير الـ schema |
| Custom setting اتحذف بعد sync | `isCustom` مش `true` في الـ DB | الـ settings اللي بتتعمل عن طريق API لازم يكون `isCustom: true` |
```
