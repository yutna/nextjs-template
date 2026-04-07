---
name: nextjs-i18n
description: This skill should be used when working with i18n, translation, locale, or internationalization. Guides next-intl setup, locale routing, and message management.
---

# Next.js Internationalization (i18n)

Use this skill when implementing internationalization with next-intl.

## Reference

- .claude/workflow-profile.json (locales configuration)
- src/shared/config/i18n.ts (i18n configuration)

## Configuration

### Supported Locales

```typescript
// src/shared/config/i18n.ts
export const locales = ['en', 'th'] as const;
export const defaultLocale = 'en' as const;
export type Locale = (typeof locales)[number];
```

### next-intl Setup

```typescript
// src/i18n.ts
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/shared/config/i18n';

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`./messages/${locale}`)).default,
  };
});
```

### Middleware

```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/shared/config/i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

## Message Structure

Translation structure is the one area where DRY can be relaxed deliberately because enterprise message catalogs become large and repetitive. Do not over-normalize messages at the cost of maintainability.

Even with that exception, message layout must remain predictable:
- locale root stays shallow
- common/shared/module seams stay explicit
- modules should own their own message trees
- scaling a module should prefer deeper folders over dumping everything into one file

### Directory Layout

```
src/messages/
├── en/
│   ├── index.ts           # Barrel export
│   ├── common.json        # Shared messages
│   ├── errors.json        # Error messages
│   └── modules/
│       ├── users/
│       │   └── index.json
│       └── dashboard/
│           └── index.json
└── th/
    ├── index.ts
    ├── common.json
    ├── errors.json
    └── modules/
        ├── users/
        │   └── index.json
        └── dashboard/
            └── index.json
```

### Barrel Export

```typescript
// src/messages/en/index.ts
import common from './common.json';
import errors from './errors.json';
import users from './modules/users/index.json';
import dashboard from './modules/dashboard/index.json';

export default {
  common,
  errors,
  modules: {
    users,
    dashboard,
  },
} as const;
```

### Message File Format

```json
// src/messages/en/modules/users/index.json
{
  "title": "Users",
  "list": {
    "heading": "User List",
    "empty": "No users found",
    "loading": "Loading users..."
  },
  "form": {
    "name": "Name",
    "email": "Email",
    "submit": "Create User",
    "validation": {
      "nameRequired": "Name is required",
      "emailInvalid": "Please enter a valid email"
    }
  },
  "actions": {
    "edit": "Edit",
    "delete": "Delete",
    "confirmDelete": "Are you sure you want to delete {name}?"
  }
}
```

## Using Translations

### In Server Components

```tsx
// src/modules/users/screens/UserListScreen.tsx
import { getTranslations } from 'next-intl/server';

export async function UserListScreen() {
  const t = await getTranslations('modules.users');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('list.heading')}</p>
    </div>
  );
}
```

### In Client Components

```tsx
// src/modules/users/containers/UserFormContainer.tsx
'use client';

import { useTranslations } from 'next-intl';

export function UserFormContainer() {
  const t = useTranslations('modules.users.form');

  return (
    <form>
      <label>{t('name')}</label>
      <input name="name" />
      <button type="submit">{t('submit')}</button>
    </form>
  );
}
```

### With Variables

```tsx
// Message: "Welcome, {name}!"
const t = useTranslations('common');
t('welcome', { name: user.name }); // "Welcome, John!"

// Message: "You have {count, plural, =0 {no items} one {# item} other {# items}}"
t('items', { count: 5 }); // "You have 5 items"
```

### With Rich Text

```tsx
// Message: "Please <link>contact us</link> for help"
t.rich('helpText', {
  link: (chunks) => <a href="/contact">{chunks}</a>,
});
```

## Locale Switching

### Link Component

```tsx
import { Link } from '@/shared/components/Link';

export function LocaleSwitcher() {
  return (
    <nav>
      <Link href="/dashboard" locale="en">English</Link>
      <Link href="/dashboard" locale="th">ไทย</Link>
    </nav>
  );
}
```

### Programmatic Navigation

```tsx
'use client';

import { useRouter, usePathname } from '@/shared/lib/navigation';

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (locale: string) => {
    router.replace(pathname, { locale });
  };

  return (
    <select onChange={(e) => switchLocale(e.target.value)}>
      <option value="en">English</option>
      <option value="th">ไทย</option>
    </select>
  );
}
```

## Adding New Module Translations

1. Create message files:
   ```bash
   mkdir -p src/messages/en/modules/<module-name>
   mkdir -p src/messages/th/modules/<module-name>
   ```

2. Add JSON files:
   ```json
   // src/messages/en/modules/<module-name>/index.json
   {
     "title": "Module Title",
     "description": "Module description"
   }
   ```

3. Update barrel exports:
   ```typescript
   // src/messages/en/index.ts
   import newModule from './modules/<module-name>/index.json';

   export default {
     // ...existing
     modules: {
       // ...existing
       newModule,
     },
   };
   ```

4. Use in components:
   ```tsx
   const t = await getTranslations('modules.newModule');
   ```

## Type Safety

### Generate Types

```typescript
// src/types/i18n.d.ts
import en from '@/messages/en';

type Messages = typeof en;

declare global {
  interface IntlMessages extends Messages {}
}
```

## Do Not

- Hardcode user-facing strings — always use translations
- Mix locales in the same file — keep en/ and th/ separate
- Skip the barrel export — it ensures all messages are loaded
- Use string concatenation for translations — use ICU message format
- Collapse unrelated enterprise message groups into one oversized file when a deeper folder split would be clearer
