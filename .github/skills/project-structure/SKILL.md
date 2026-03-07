---
name: project-structure
description: >
  Project conventions for layouts and route helpers. Use when creating, modifying,
  or reviewing files in shared/layouts/, modules/{module}/layouts/, shared/routes/,
  or App Router layout.tsx files. Covers reusable layout composition, route-boundary
  adapters, and route helper path builder patterns.
---

# Project Structure: Layouts and Routes

This skill covers the conventions for reusable layouts and route helper
path builders in this repository.

## Scope

Use this skill when:

- creating or modifying files in `src/shared/layouts/`
- creating or modifying files in `src/modules/{module}/layouts/`
- creating or modifying files in `src/shared/routes/`
- writing or reviewing App Router `layout.tsx` files
- adding new route helper path builders

## Layouts Overview

Layouts provide reusable page framing components that compose structure
around `children`. They establish consistent composition patterns for
headers, sidebars, shells, content regions, and section rails.

### Where Layouts Live

- **Module layouts**: `src/modules/<module-name>/layouts/` for
  feature-scoped frames
- **Shared layouts**: `src/shared/layouts/` for cross-module or
  app-wide frames

Choose the narrowest valid scope first. Promote to `shared/` only when
multiple unrelated modules use the same frame.

### Layout vs App Router layout.tsx

App Router `layout.tsx` files are thin route-boundary adapters. They
handle route-boundary concerns and delegate reusable structure to layout
components.

```tsx
// src/app/[locale]/(private)/dashboard/layout.tsx
import { LayoutTwoColumns } from "@/modules/dashboard/layouts/layout-two-columns";

import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({
  children,
}: Readonly<LayoutProps>) {
  return <LayoutTwoColumns>{children}</LayoutTwoColumns>;
}
```

### Layout File Structure

Each reusable layout lives in its own leaf folder with a `layout-` prefix:

```txt
src/shared/layouts/layout-default/
├── layout-default.tsx
├── index.ts
└── types.ts

src/modules/dashboard/layouts/layout-two-columns/
├── layout-two-columns.tsx
├── layout-two-columns.test.tsx
├── index.ts
└── types.ts
```

Rules:

- One public layout per folder
- Prefix folder names with `layout-`
- Folder name and main file name match
- Leaf-level `index.ts` for the public API
- Colocate `types.ts` when the layout owns its props
- No parent barrel files for the layouts directory

### Layout Naming

- Folders and files: `layout-default`, `layout-two-columns`
- Exports: `LayoutDefault`, `LayoutTwoColumns`
- Slot props: `children`, `header`, `sidebar`, `footer`
- Avoid: `wrapper`, `container`, `main`, `layout-1`

### Layout Props

```ts
export interface LayoutTwoColumnsProps {
  children: ReactNode;
  sidebar?: ReactNode;
}
```

- Export from `index.ts` with `export type`
- Prefer explicit structural props over generic config objects
- Wrap with `Readonly<...>` at the component boundary

### Layout Composition Rules

- Accept `children` and explicit slots for structural regions
- Keep responsibilities focused on framing and composition
- Do not turn a layout into a hidden service layer
- Use Chakra layout primitives for structural styling
- Keep layouts as Server Components by default

### Layout Testing

- Use Vitest and Testing Library
- Keep tests next to the layout they cover
- Test rendered regions and structural behavior
- Verify `children` and slots render in the correct places

## Routes Overview

Route helpers in `src/shared/routes/` are the single source of truth
for user-facing path builders. Application code should use route helpers
instead of hardcoded path strings.

### What Belongs in shared/routes

- User-facing page paths
- Path builders for dynamic segments
- Route group organization: `root`, `public`, `private`
- Paths consumed by links, redirects, and navigation

What does **not** belong:

- Route-group syntax like `(public)` or `(private)` in returned URLs
- Slot names like `@modal`
- Interceptor matchers like `(.)` or `(..)`
- Locale prefixes (handled by the navigation layer)

### Route File Structure

```txt
src/shared/routes/
├── index.ts
├── root/
│   └── index.ts
├── public/
│   ├── index.ts
│   └── sign-in/
│       └── index.ts
└── private/
    ├── index.ts
    └── dashboard/
        └── index.ts
```

### Route Public API Shape

Every route helper exposes a `path` function returning a plain string:

```ts
routes.root.path();
routes.public.signIn.path();
routes.private.dashboard.path();
routes.private.users.detail.path(userId);
```

- Static routes: `path: () => "/sign-in"`
- Dynamic routes: `path: (userId: string) => \`/users/${userId}\``
- Use `path` consistently; avoid `url`, `href`, `to`, or `buildPath`

### Dynamic Segment Conventions

```ts
export const users = {
  detail: {
    path: (userId: string) => `/users/${userId}`,
  },
};
```

Use descriptive parameter names: `userId`, `slug`, `invoiceId`.
Avoid generic names like `value` or `id`.

### Route Consumption

```tsx
<Link href={routes.root.path()} />
```

```ts
redirect(routes.private.dashboard.path());
```

Use route helpers with `Link` and `redirect` from
`@/shared/lib/navigation`. Do not hardcode path strings.

### Locale Handling

Route helpers return locale-neutral paths. The locale is applied by the
navigation layer (`@/shared/lib/navigation`).

- Return `"/"` not `"/en"` or `"/th"`
- Do not add locale parameters to route builder APIs

## Common Mistakes

### Layout Mistakes

- Letting `layout.tsx` become the home for reusable visual structure
- Converting an entire layout to client-only for one interactive widget
- Creating `layouts/` folders for styled wrappers with no structural
  contract
- Using generic names like `wrapper` or `container`
- Skipping `index.ts` or `types.ts` in layout folders

### Route Mistakes

- Leaking route-group syntax like `(public)` into returned URLs
- Exposing slot or interceptor syntax in route helpers
- Hardcoding path strings across components instead of using helpers
- Mixing locale prefixes into route helper outputs
- Using inconsistent helper names instead of `path`
- Modeling filesystem structure more literally than the URL requires

## Checklist

### Layout Checklist

- [ ] Does it provide a reusable structural frame around `children`?
- [ ] Is the scope correct: module first, shared only when cross-cutting?
- [ ] Is the App Router `layout.tsx` staying thin?
- [ ] Is the folder named after one clear structural role?
- [ ] Are props explicit and layout-oriented?
- [ ] Are server/client boundaries kept as low as possible?
- [ ] Are tests covering the layout contract?

### Route Checklist

- [ ] Does the helper represent a real user-facing URL?
- [ ] Does it return the real URL, not route-group syntax?
- [ ] Does a dynamic route accept explicit descriptive parameters?
- [ ] Is locale handling left to the navigation layer?
- [ ] Will consuming code use the helper instead of a hardcoded string?

## References

- See `references/layout-patterns.md` for the full layouts guide.
- See `references/route-patterns.md` for the full routes guide.
