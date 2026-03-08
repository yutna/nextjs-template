# Page Entry Patterns

This reference defines how to write normal App Router `page.tsx` files under
`src/app/**/page.tsx`.

It focuses on standard route-entry pages such as `src/app/[locale]/page.tsx`.
Special pages like a root redirect page or a catch-all notFound page are
exceptions and are mentioned only briefly.

Use `page.tsx` as a thin, server-only route-entry adapter. Its main job is to
handle route-entry concerns and return one screen directly.

## 1. Decide what belongs in page.tsx

Put code in `page.tsx` when it does one or more of the following:

- acts as the Next.js route entry
- receives route params or search params
- performs route-entry setup required by the route
- performs locale setup for locale-aware pages
- returns one screen directly

Examples:

- route param handoff
- locale setup for `[locale]`
- route-entry redirect or `notFound()` when that is the page's purpose

Do **not** put code in `page.tsx` when it belongs somewhere more specific:

- `screens/` for module-level page UI
- `containers/` for logic binding
- `components/` for presenter UI
- `layouts/` for reusable framing around `children`
- `loading.tsx`, `error.tsx`, or `template.tsx` for those App Router
  responsibilities

Rule of thumb:

- if the concern exists because Next.js needs a route entry, it probably belongs
  in `page.tsx`
- if the concern is about page UI composition, it probably belongs in a screen

## 2. Always server-only

Normal `page.tsx` files should always start with:

```ts
import "server-only";
```

Why:

- `page.tsx` is the route-entry boundary
- this repository wants server-first page files
- route-entry setup should stay on the server side

Do not add `"use client"` to normal `page.tsx` files.

If a route needs client interaction, return a server-first screen and let the
screen compose containers beneath it.

## 3. One page returns one screen

`page.tsx` has a direct 1-to-1 relationship with screens.

Required direction:

- one `page.tsx` returns one screen directly
- one screen belongs to one `page.tsx`

Good direction:

```tsx
import "server-only";

import { ScreenWelcome } from "@/modules/static-pages/screens/screen-welcome";

export default function Page() {
  return <ScreenWelcome />;
}
```

This keeps:

- route-entry concerns in `page.tsx`
- page UI assembly in the screen
- logic binding in containers
- rendering details in components

Do not let `page.tsx`:

- assemble many containers directly
- render presenter components directly as the normal pattern
- become a second screen layer

## 4. Keep page.tsx thin

`page.tsx` should stay small and focused.

Prefer:

- route params handoff
- locale setup
- route-entry validation or redirect behavior
- returning the screen directly

Avoid:

- page-level visual composition
- presenter wiring
- business logic
- client hooks
- container orchestration

If the file starts looking like a screen, move that composition into
`modules/<module-name>/screens`.

## 5. Locale pattern and next-intl setup

For locale-aware pages under `[locale]`, follow the repository's existing
pattern.

Current example:

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

Rules for this pattern:

- read the locale from route params
- call `setRequestLocale(locale)` in the locale page
- pass the locale or other route-shaped inputs into the screen
- keep the page thin even when locale setup is required

This locale setup supports the route's static rendering strategy under
`[locale]`. Keep that setup in `page.tsx` instead of pushing it down into the
screen.

## 6. Relationship with other App Router files

This guide stays focused on `page.tsx`, so other App Router files are mentioned
only enough to define the boundary.

Use:

- `page.tsx` for route entry
- `layout.tsx` for route-boundary layout concerns
- `loading.tsx` for loading UI
- `error.tsx` for route-segment error UI
- `template.tsx` for template boundaries

Do not move those responsibilities into `page.tsx`.

## 7. Naming

For exported symbols in normal `page.tsx` files:

- use the default export required by Next.js
- name the function `Page`

Good:

- `export default function Page() {}`

Avoid:

- `export default function WelcomePage() {}`
- `export default function LocalePage() {}`
- `export default function PageWelcome() {}`

Keep route-entry naming boring and consistent. The meaningful name belongs to
the screen, not to the route-entry function.

## 8. Props and API shape

`page.tsx` should only accept route-entry inputs.

Prefer:

- `params`
- `searchParams` when the route actually needs them
- readonly typing for props

Avoid:

- large custom prop types unrelated to the route
- passing many concern-owned dependencies from `page.tsx` into the screen
- treating `page.tsx` like a generic wrapper component

If many concern-owned values are being passed downward, the file is likely
carrying responsibilities that belong in the screen or container layer.

## 9. Exceptions

This guide focuses on normal route-entry pages, but some `page.tsx` files are
special-purpose exceptions.

Examples in the current repository:

- root redirect page
- catch-all notFound page

These files may:

- call `redirect(...)`
- call `notFound()`
- skip screen rendering entirely because the route entry itself is the whole
  purpose

Treat these as exceptions, not the default `page.tsx` pattern.

## 10. Examples

### Good normal route-entry page

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

### Good special exception

```tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/en");
}
```

This is acceptable because the route entry itself is only a redirect and does
not represent a normal page-to-screen flow.

## 11. Checklist

Before writing a normal `page.tsx`, check:

- does the file start with `import "server-only";`?
- is the file staying thin and route-focused?
- does it return exactly one screen directly?
- is the screen the real owner of page UI composition?
- are locale-aware pages doing `setRequestLocale(locale)` where required?
- are route-entry concerns staying in `page.tsx` instead of leaking into the
  screen?
- are other App Router responsibilities staying in their own files?
- is the default export named `Page` for normal route entries?
