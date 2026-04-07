---
name: nextjs-i18n
description: This skill should be used when working with i18n, translation, locale, or internationalization. Guides next-intl setup, locale routing, and message management.
---

# Next.js Internationalization (i18n)

Use this skill when implementing internationalization with next-intl.

## Reference

- .claude/workflow-profile.json (locales configuration)
- src/shared/config/i18n/routing.ts
- src/shared/config/i18n/request.tsx
- src/messages/

## Configuration

### Supported Locales

```typescript
// src/shared/constants/locale.ts
export const LOCALES = ["th", "en"] as const;
```

### next-intl Setup

```typescript
// src/shared/config/i18n/request.tsx
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { messages } from "@/messages";
import { formats } from "@/shared/config/i18n/formats";
import { routing } from "@/shared/config/i18n/routing";
import { TIME_ZONE } from "@/shared/constants/timezone";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    formats,
    locale,
    messages: messages[locale],
    now: new Date(),
    timeZone: TIME_ZONE,
  };
});
```

### Middleware

```typescript
// src/proxy.ts
import createMiddleware from "next-intl/middleware";

import { routing } from "./shared/config/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
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
├── index.ts
├── en/
│   ├── index.ts
│   ├── common/
│   │   ├── index.ts
│   │   ├── actions.json
│   │   └── validation.json
│   ├── modules/
│   │   ├── index.ts
│   │   └── static-pages/
│   │       ├── index.ts
│   │       ├── components/
│   │       │   ├── index.ts
│   │       │   └── landing-hero.json
│   │       └── hooks/
│   │           ├── index.ts
│   │           └── use-copy-command.json
│   └── shared/
│       ├── index.ts
│       └── components/
│           ├── index.ts
│           └── error.json
└── th/
    └── ...mirror the same composition
```

### Composition Example

```typescript
// src/messages/en/modules/static-pages/components/index.ts
import landingHero from "./landing-hero.json";

export const components = {
  landingHero,
};

// src/messages/en/modules/static-pages/index.ts
import { components } from "./components";
import { hooks } from "./hooks";

export const staticPages = {
  components,
  hooks,
};

// src/messages/en/modules/index.ts
import { staticPages } from "./static-pages";

export const modules = {
  staticPages,
};
```

### Leaf Message File Format

```json
// src/messages/en/modules/static-pages/components/landing-hero.json
{
  "getStarted": "View on GitHub",
  "installCommand": "git clone --depth 1 ...",
  "subtitle": "A production-ready Next.js 16 template...",
  "title": "Vibe Coding\nFrom Prompt to IPO"
}
```

## Using Translations

### In Server Components

```tsx
// src/modules/static-pages/screens/screen-welcome/screen-welcome.tsx
import { getTranslations } from 'next-intl/server';

export async function ScreenWelcome() {
  const t = await getTranslations('modules.staticPages.components.landingHero');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
    </div>
  );
}
```

### In Client Components

```tsx
// src/shared/components/error-banner/error-banner.tsx
'use client';

import { useTranslations } from 'next-intl';

export function ErrorBanner() {
  const t = useTranslations('shared.components.error');

  return (
    <button type="button">{t('tryAgain')}</button>
  );
}
```

### With Variables

```tsx
// Message: "Welcome, {name}!"
const t = useTranslations('common.actions');
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
import { Link } from '@/shared/lib/navigation';

export function LocaleSwitcher() {
  return (
    <nav>
      <Link href="/" locale="en">English</Link>
      <Link href="/" locale="th">ไทย</Link>
    </nav>
  );
}
```

### Programmatic Navigation

```tsx
'use client';

import { usePathname, useRouter } from '@/shared/lib/navigation';

import type { Locale } from 'next-intl';

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (locale: Locale) => {
    router.replace(pathname, { locale });
  };

  return (
    <select
      onChange={(event) => {
        const next = event.currentTarget.value;
        if (next === "en" || next === "th") {
          switchLocale(next);
        }
      }}
    >
      <option value="en">English</option>
      <option value="th">ไทย</option>
    </select>
  );
}
```

## Adding New Module Translations

1. Create message files:
   ```bash
   mkdir -p src/messages/en/modules/<module-name>/components
   mkdir -p src/messages/th/modules/<module-name>/components
   ```

2. Add leaf JSON files:
   ```json
   // src/messages/en/modules/<module-name>/components/section-<module-name>.json
   {
      "title": "Module Title",
      "subtitle": "Module description"
    }
   ```

3. Compose the folder:
   ```typescript
   // src/messages/en/modules/<module-name>/components/index.ts
   import sectionModuleName from "./section-<module-name>.json";

   export const components = {
     sectionModuleName,
   };

   // src/messages/en/modules/<module-name>/index.ts
   import { components } from "./components";

   export const moduleMessages = {
     components,
   };
   ```

4. Update `src/messages/en/modules/index.ts` and `src/messages/th/modules/index.ts`
   to export the new module.

5. Use in components:
   ```tsx
   const t = await getTranslations('modules.<moduleNamespace>.components.<surfaceNamespace>');
   ```

## Type Safety

### Generate Types

```typescript
// src/types/i18n.d.ts
import { messages } from '@/messages';

type Messages = typeof messages.en;

declare global {
  interface IntlMessages extends Messages {}
}
```

## Do Not

- Hardcode user-facing strings — always use translations
- Mix locales in the same file — keep en/ and th/ separate
- Skip the `index.ts` composition update — it ensures all messages are reachable
- Use string concatenation for translations — use ICU message format
- Collapse unrelated enterprise message groups into one oversized file when a deeper folder split would be clearer
