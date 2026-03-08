---
applyTo: "src/app/**/page.tsx"
---

# Page Entry Guardrails

Rules for writing `page.tsx` files under `src/app/**/`.

## Always server-only

Every normal `page.tsx` must start with:

```ts
import "server-only";
```

Do **not** add `"use client"` to page files.

## One page returns one screen

Each `page.tsx` has a 1-to-1 relationship with a screen:

- one `page.tsx` returns one screen directly
- one screen belongs to one `page.tsx`

```tsx
import "server-only";

import { ScreenWelcome } from "@/modules/static-pages/screens/screen-welcome";

export default function Page() {
  return <ScreenWelcome />;
}
```

## Keep it thin

A `page.tsx` should only handle route-entry concerns:

- route params handoff
- locale setup
- returning the screen

Do **not** put these in `page.tsx`:

- page-level visual composition
- business logic or presenter wiring
- client hooks or container orchestration
- direct rendering of containers or presenter components

## Naming

- always name the default export `Page`
- avoid `WelcomePage`, `LocalePage`, or `PageWelcome`

## Locale pattern

For pages under `[locale]`, follow this pattern:

```tsx
import "server-only";

import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import { ScreenWelcome } from "@/modules/static-pages/screens/screen-welcome";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function Page({ params }: Readonly<PageProps>) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <ScreenWelcome locale={locale} />;
}
```

## Props

- accept only `params` and `searchParams`
- use `Readonly<>` for prop types
- do not pass large concern-owned dependency bags into the screen

## Exceptions

Special-purpose pages (root redirect, catch-all notFound) may skip the
screen pattern:

```tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/en");
}
```

## Checklist

- [ ] Starts with `import "server-only";`
- [ ] Stays thin and route-focused
- [ ] Returns exactly one screen
- [ ] Default export named `Page`
- [ ] Locale pages call `setRequestLocale(locale)`
- [ ] No `"use client"`
- [ ] No direct container or component rendering
- [ ] Other App Router concerns stay in their own files
