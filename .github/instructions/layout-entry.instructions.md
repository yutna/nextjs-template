---
applyTo: "src/app/**/layout.tsx"
---

# Layout Entry Guardrails

Rules for writing App Router `layout.tsx` files under `src/app/**/`.

## Thin route-boundary adapters

`layout.tsx` files exist because Next.js requires them. Keep them thin and
delegate reusable visual structure elsewhere.

## Naming

- use `Layout` for all App Router layout components
- use `RootLayout` only for `src/app/layout.tsx`

## What belongs in layout.tsx

- defining the route boundary
- metadata and `generateStaticParams`
- locale validation and request-level setup
- wiring providers that must live at this boundary
- delegating to a reusable layout component

```tsx
import { LayoutTwoColumns } from "@/modules/dashboard/layouts/layout-two-columns";

import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: Readonly<LayoutProps>) {
  return <LayoutTwoColumns>{children}</LayoutTwoColumns>;
}
```

## What does NOT belong

- large reusable visual structure (move to `shared/layouts` or `modules/*/layouts`)
- business logic or data orchestration
- presenter components rendered directly

## Locale boundary pattern

`src/app/[locale]/layout.tsx` owns the locale boundary for the app:

```tsx
import "server-only";

import { hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing } from "@/shared/config/i18n/routing";
import { AppProvider } from "@/shared/providers/app-provider";

import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Layout({
  children,
  params,
}: Readonly<LayoutProps>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <AppProvider locale={locale} messages={messages}>
      {children}
    </AppProvider>
  );
}
```

Key locale-boundary responsibilities:

- `import "server-only";`
- read and validate locale from params
- call `setRequestLocale(locale)`
- keep `generateStaticParams()` for the locale segment
- load messages and wire locale-aware providers

## Reusable layout placement

- module-specific frames go in `src/modules/<module>/layouts/layout-*/`
- cross-module frames go in `src/shared/layouts/layout-*/`
- each reusable layout lives in its own `layout-{name}/` leaf folder

## Server-first

- keep layouts as Server Components by default
- add `"use client"` only when truly required
- isolate interactive pieces into child components

## Checklist

- [ ] Layout.tsx stays thin, delegating reusable structure
- [ ] Named `Layout` (or `RootLayout` for root)
- [ ] Locale layout uses `import "server-only";`
- [ ] Locale layout validates locale and calls `setRequestLocale`
- [ ] Reusable visual frames live in `shared/layouts` or `modules/*/layouts`
- [ ] Server-first by default
- [ ] No embedded large markup trees that should be extracted
