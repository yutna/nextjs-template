# Screens Folder Style Guide

This guide defines how to write and organize screen components inside:

- `src/modules/<module-name>/screens`

Use `screens/` for module-level UI entries that sit directly under `page.tsx` and directly above containers. A screen represents one page-level module UI concern, and in this architecture it has a 1-to-1 relationship with `page.tsx`: one `page.tsx` returns one screen directly, and one screen belongs to one `page.tsx`.

## 1. Decide whether code belongs in `screens`

Put code in a `screens` folder when it does one or more of the following:

- acts as the module-level entry for one page
- assembles one page-shaped UI concern for one `page.tsx`
- binds page-level server inputs to module containers
- defines the top-level composition for one screen, without dropping down into presenter-level details

Examples:

- welcome screen
- profile screen
- checkout screen
- order detail screen

Do **not** put code in `screens` when it belongs somewhere more specific:

- `app/**/page.tsx` for the Next.js route entry file
- `containers/` for logic binding
- `components/` for presenter UI
- `layouts/` for reusable framing around `children`
- `hooks/` for extracted client logic

Rule of thumb:

- if the file is the module-level page UI entry returned by one `page.tsx`, `screens/` is usually correct
- if the file mainly binds logic or mainly renders presenters, it likely belongs in another layer

## 2. One `page.tsx` -> one screen

Screens have a direct 1-to-1 relationship with `page.tsx`.

Required direction:

- one `page.tsx` returns one screen directly
- one screen belongs to one `page.tsx`

Good direction:

```tsx
// src/app/[locale]/page.tsx
import { ScreenWelcome } from "@/modules/static-pages/screens/screen-welcome";

export default function Page() {
  return <ScreenWelcome />;
}
```

This keeps:

- route-entry concerns in `page.tsx`
- module-level UI assembly in the screen
- logic binding in containers
- rendering details in components

Do not let one `page.tsx` assemble many containers directly. That composition belongs in the screen.

## 3. Relationship to App Router

This guide stays focused on `screens`, so App Router files are mentioned only enough to define the boundary.

Use `page.tsx` for:

- route entry
- params and search params handoff
- locale setup when required by the route
- redirects or `notFound()` when they belong to the route entry
- returning the screen directly

Keep other App Router segment files in `app/`:

- `layout.tsx`
- `loading.tsx`
- `error.tsx`
- `template.tsx`

Screens should not replace those files. Screens live beneath `page.tsx`, not alongside App Router framework responsibilities.

## 4. Screens compose containers only

In this architecture, screens compose containers, not presenter components directly.

Required direction:

`page.tsx` -> `screen` -> `container` -> `component`

Keep the responsibility clear:

- `page.tsx` enters the route
- `screen` assembles the module-level page
- `container` binds logic
- `component` presents

Do not let screens:

- render presenter components directly as the primary page assembly pattern
- absorb business logic that belongs in containers, hooks, actions, or lib
- become a second route layer that duplicates `page.tsx`

If a screen starts orchestrating presenter props directly, that usually means a container is missing.

## 5. Server-first default

Screens should stay server-first by default.

Prefer screens that:

- remain server components unless there is a real reason otherwise
- receive route-boundary inputs from `page.tsx`
- compose containers in a clear top-down way
- avoid owning client interaction logic

Good fits for screens:

- receiving `locale`, params-derived identifiers, or server-safe values from `page.tsx`
- arranging the order of containers on the page
- defining the page-level structure inside the module boundary

Avoid:

- putting `"use client"` on screens by default
- consuming client hooks directly in screens
- turning the screen into a container

If a screen needs client interaction, prefer moving that concern into a container beneath it.

## 6. Scope and placement

Screens are module-owned.

Use:

- `src/modules/<module-name>/screens`

Do **not** use:

- `src/shared/screens`

Why:

- a screen belongs to one page
- one page belongs to one route entry
- that ownership is inherently module-local

If something becomes reusable across pages or modules, it likely belongs in `layouts/`, `components/`, `hooks/`, or another shared layer instead of `screens/`.

## 7. File and folder structure

Follow the repository's kebab-case convention for files and folders.

Each public screen should live in its own leaf folder:

```txt
src/modules/static-pages/screens/screen-welcome/
├── index.ts
├── screen-welcome.test.tsx
├── screen-welcome.tsx
└── types.ts

src/modules/profile/screens/screen-profile/
├── index.ts
├── screen-profile.tsx
└── types.ts
```

Rules:

- keep one public screen per folder
- prefix the folder and main implementation file with `screen-`
- add a leaf-level `index.ts` for the public API
- colocate `types.ts` when the screen owns reusable contracts
- keep tests adjacent to the screen they cover
- do not create parent barrel files for `src/modules/<module-name>/screens`
- do not colocate presenter components inside the screen folder unless the repository convention changes

If code inside a screen folder starts splitting into presenter pieces or reusable logic helpers, move those concerns to `components/`, `containers/`, `hooks/`, or another more specific layer.

## 8. Naming

Use specific kebab-case folder and file names:

- `screen-welcome`
- `screen-profile`
- `screen-checkout`
- `screen-order-detail`

Avoid vague names such as:

- `screen`
- `page-screen`
- `main-screen`
- `content`

For exported symbols:

- use PascalCase names prefixed with `Screen`
- derive the name from the page concern, not from a low-level presenter name

Examples:

- `ScreenWelcome`
- `ScreenProfile`
- `ScreenCheckout`
- `ScreenOrderDetail`

## 9. Props and API shape

Screens should have small, route-shaped APIs.

Prefer:

- only the inputs that come naturally from `page.tsx`
- props such as `locale`, route params, or route-derived identifiers
- readonly prop typing for object-shaped inputs

Avoid:

- large prop bags passed down from `page.tsx`
- passing many concern-owned actions or data loaders into the screen
- turning the screen into a generic wrapper with no clear page ownership

If many values are being threaded through the screen into a container, reconsider whether the container should import or load more of its own concern-owned dependencies.

## 10. Examples

### Good page entry

```tsx
// src/app/[locale]/page.tsx
import "server-only";

import { use } from "react";
import { setRequestLocale } from "next-intl/server";

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

### Good screen direction

```tsx
// src/modules/profile/screens/screen-profile/screen-profile.tsx
import "server-only";

import { Box } from "@chakra-ui/react";

import { ContainerFormProfile } from "@/modules/profile/containers/container-form-profile";
import { ContainerHeaderProfile } from "@/modules/profile/containers/container-header-profile";

import type { ScreenProfileProps } from "./types";

export async function ScreenProfile({ locale }: Readonly<ScreenProfileProps>) {
  return (
    <Box as="main">
      <ContainerHeaderProfile locale={locale} />
      <ContainerFormProfile />
    </Box>
  );
}
```

This keeps the screen focused on page-level assembly while containers own the binding below it.

## 11. Checklist

Before adding a file to `src/modules/<module-name>/screens`, check:

- does one `page.tsx` return this one screen directly?
- does this one screen belong to one `page.tsx`?
- is the screen composing containers rather than presenter components directly?
- is the screen staying server-first unless there is a real reason not to?
- is the folder name specific and prefixed with `screen-`?
- is the exported symbol a clear `*Screen` name?
- are route-boundary concerns still staying in `page.tsx` or other App Router files?
- are props small and route-shaped rather than a large drilled object?
