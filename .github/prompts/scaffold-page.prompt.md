---
name: scaffold-page
description: >-
  Create a complete page with screen, container, and
  component following project architecture
agent: agent
tools: ['edit/editFiles', 'search/codebase']
argument-hint: >-
  [module-name] [page-name] [route-group]
  e.g. profile settings private
---

# Scaffold page chain

Create the full `page.tsx` to screen to container to
component chain for a new route.

## Input

`${input}` contains three space-separated values:

1. **module-name** — kebab-case feature module name
1. **page-name** — kebab-case page name
1. **route-group** — `public` or `private`

## Architecture rules

- `page.tsx` is a thin server-only route entry
- One `page.tsx` returns exactly one screen
- Screens compose containers only
- Containers are the bridge layer binding logic to UI
- Components are stateless presenters

## File creation steps

### 1 — Route entry

Create `src/app/[locale]/(${route-group})/${page-name}/page.tsx`:

```typescript
import "server-only";

import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import { ScreenName } from "@/modules/${module}/screens/screen-${page}";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function Page({ params }: Readonly<PageProps>) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <ScreenName locale={locale} />;
}
```

Name the default export `Page`. Do **not** add a custom
name like `SettingsPage`.

### 2 — Screen

Create a folder at
`src/modules/${module}/screens/screen-${page}/` with:

- `screen-${page}.tsx` — server-first, composes containers
- `types.ts` — props interface accepting `locale`
- `index.ts` — barrel exporting component and type

Use `import "server-only"` at the top. Use named exports.

### 3 — Container

Create a folder at
`src/modules/${module}/containers/container-${page}/` with:

- `container-${page}.tsx` — bridge layer, self-contained
- `types.ts` — props interface
- `index.ts` — barrel export

Keep the container server-first unless client interaction
is required. If `"use client"` is needed, add it only to
this file.

### 4 — Component

Create a folder at
`src/modules/${module}/components/${page}/` with:

- `${page}.tsx` — stateless presenter, named export
- `types.ts` — props interface with `Readonly<Props>`
- `index.ts` — barrel export
- `${page}.test.tsx` — basic render test

## Conventions

- All folders use **kebab-case**
- All React components use **PascalCase** named exports
- Every leaf folder has an `index.ts` barrel
- Every component folder has a `types.ts`
- Use `@/` alias for cross-folder imports
- Do not use `../` parent imports
