# Layouts Folder Style Guide

This guide defines how to write and organize code inside:

- `src/shared/layouts`
- `src/modules/<module-name>/layouts`

It also defines how reusable layouts should relate to route-boundary files such as:

- `src/app/layout.tsx`
- `src/app/**/layout.tsx`

Use `layouts` for reusable page framing components that provide structure around `children` and establish consistent composition patterns. Keep route-boundary App Router `layout.tsx` files thin and move reusable structure into `shared/layouts` or `modules/<module-name>/layouts`.

## 1. Decide whether code belongs in `layouts`

Put code in a `layouts` folder when it does one or more of the following:

- provides a reusable structural frame around `children`
- composes repeated page chrome such as headers, sidebars, shells, content regions, or section rails
- establishes consistent page-level or feature-level spacing, slots, and layout regions
- is intended to be shared across multiple routes within a feature or across multiple features
- represents layout composition rather than one specific page's final content

Examples:

- an app shell with navigation and content regions
- an auth layout wrapping sign-in and forgot-password pages
- a dashboard layout shared by multiple private pages
- a marketing layout that provides shared hero/footer framing for a family of routes

Do **not** put code in `layouts` when it belongs somewhere more specific:

- `src/app/**/layout.tsx` for the route-boundary file required by Next.js
- other UI folders such as page, screen, container, or component folders when the code is not defining a reusable frame
- `lib/` for infrastructure and integrations
- `providers/` for context/provider composition
- `styles/` or Chakra props for styling concerns without reusable structural ownership

Rule of thumb:

- If the code's main purpose is to frame `children`, it is likely a layout.
- If it does not define a reusable frame, it likely belongs in another UI layer.

## 2. Relationship to App Router `layout.tsx`

`src/app/**/layout.tsx` files are route-boundary adapters. They exist because Next.js requires them, but they should stay thin.

Naming:

- use `Layout` for App Router `layout.tsx` components
- use `RootLayout` only for `src/app/layout.tsx`

Use App Router layout files for:

- defining the route boundary
- handling route-boundary concerns such as metadata, `generateStaticParams`, locale validation, and request-level setup
- wiring providers or wrappers that must live at that route boundary
- delegating reusable structure to a layout component when the UI frame is not route-specific

Do **not** let `src/app/**/layout.tsx` become the long-term home for reusable visual structure.

Prefer:

- thin route `layout.tsx`
- reusable layout component in `shared/layouts` or `modules/<module-name>/layouts`

Good direction:

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

This keeps the route file focused on Next.js boundary needs while the reusable frame lives in the owning folder.

## 3. Boundaries with other UI folders

This guide stays focused on `layouts`, so other UI layers are mentioned here only to define the boundary.

- use `layouts/` for reusable structural frames around `children`
- use other UI folders when the code is mainly page assembly, self-contained UI logic, or presenter-only rendering

If a wrapper is only meaningful for one route and does not frame multiple pages or children-based content, it likely does not belong in `layouts/`.

## 4. Scope and placement

Choose the narrowest valid scope first.

### `src/modules/<module-name>/layouts`

Prefer module-level layouts when the structural frame belongs to one feature module.

Good fits:

- a dashboard layout used only by dashboard routes
- an account settings layout shared only inside the account module
- a checkout layout owned by the checkout feature

Examples:

- `src/modules/dashboard/layouts/layout-two-columns/`
- `src/modules/account/layouts/layout-settings/`

### `src/shared/layouts`

Promote a layout to shared only when it is truly cross-module or app-wide.

Good fits:

- an app shell used across multiple modules
- a public marketing shell used by unrelated route families
- a minimal content layout used by multiple feature areas

Examples:

- `src/shared/layouts/layout-default/`
- `src/shared/layouts/layout-public/`

Avoid moving feature-owned layouts into `shared` too early. Promote only when:

- multiple unrelated modules use the same frame
- the structure is generic and not feature-branded
- the shared location improves clarity more than it increases indirection

## 5. File and folder structure

Follow the repository's kebab-case convention for files and folders.

Each reusable layout should live in its own leaf folder:

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

- keep one public layout per folder
- prefix reusable layout folder names with `layout-`
- name the folder and main implementation file the same
- add a leaf-level `index.ts` for the layout folder
- colocate `types.ts` when the layout owns its props
- keep tests adjacent to the layout they cover
- do not create parent barrel files for `src/shared/layouts` or `src/modules/<module-name>/layouts`
- add extra files such as `slots.ts`, `constants.ts`, or internal helpers only when they materially improve clarity

If a layout grows enough to need supporting internal pieces, keep them inside the same layout folder so ownership stays obvious.

## 6. Naming

Name layouts after the structural role they play.

Prefer:

- `layout-default`
- `layout-two-columns`
- `layout-settings`
- `layout-auth`
- `layout-public`

Avoid:

- `layout-1`
- `dashboard-layout`
- `settings-layout`
- `main`
- `wrapper`
- `container`
- `page-layout` when the page name is more specific
- `shared-layout`

For exported symbols:

- use PascalCase component names derived from the file name: `LayoutDefault`, `LayoutTwoColumns`
- keep the `Layout` prefix in the component name to mirror the `layout-` file convention
- use clear slot prop names such as `children`, `header`, `sidebar`, or `footer`

Names should make sense when imported from another folder.

## 7. Public API and props

A layout folder should expose a small, intentional public API.

- export the main layout component from `index.ts`
- export layout-owned types separately with `export type`
- keep internal helper components private unless they are intentionally reusable
- prefer explicit props over vague config objects

Good:

```ts
export { LayoutTwoColumns } from "./layout-two-columns";
export type { LayoutTwoColumnsProps } from "./types";
```

Prefer layout props that describe structure clearly:

- `children`
- `header`
- `sidebar`
- `footer`
- `actions`

Avoid generic props such as:

- `data`
- `config`
- `options`

unless those names reflect a real, well-defined contract.

Use `types.ts` when the layout folder owns the props contract:

```ts
export interface LayoutTwoColumnsProps {
  children: ReactNode;
  sidebar?: ReactNode;
}
```

As with the rest of the repository, wrap props with `Readonly<...>` at the component boundary when appropriate.

## 8. Composition and data flow

Layouts should compose structure, not own unrelated business workflows.

- accept `children` and explicit slots for structural regions
- keep layout responsibilities focused on framing and composition
- let route boundaries and page-specific UI layers prepare route-specific data unless the shared frame truly owns that data
- avoid turning a layout into a hidden service layer
- keep layout logic understandable from the file structure

Good responsibilities for a layout:

- arranging header, sidebar, main content, and footer
- applying shared spacing and region wrappers
- rendering shared navigation or chrome for a route family

Usually not a fit for a layout:

- page-specific data orchestration unrelated to the frame
- one-off business logic for a single route
- generic infrastructure setup better owned by providers or lib code

If a layout needs smaller building blocks, place them in:

- the same layout folder if they are private to that layout
- the appropriate adjacent UI folder if the piece is independently owned outside the layout boundary

## 9. Server and client boundaries

Layouts should follow the repository default: Server Components first.

- keep layouts as Server Components unless they need hooks, browser APIs, or client-only behavior
- add `"use client"` only when it is truly required
- keep client-only behavior as low in the tree as practical
- do not convert an entire layout to client-only just because one child widget needs interactivity

If a layout needs interactive pieces:

- keep the main layout server-friendly when possible
- move the interactive piece into a child component
- isolate browser-only code behind a client component boundary

App Router `layout.tsx` files should also stay thin in this regard:

- keep route-boundary server work there when required
- delegate reusable visual structure to the layout folder
- avoid mixing route setup, interactivity, and large markup trees in the route file

Use `import "server-only"` only when the layout file itself must never be imported into a client bundle.

## 10. Styling expectations

Layouts should express structure first and styling second.

- use Chakra layout primitives and props for structural styling
- keep layout-level spacing, container width, and region alignment close to the layout component
- move purely visual reusable pieces into components when they are not structural
- use CSS Modules only when Chakra props are not a good fit and the styling is still owned by the layout

Avoid creating a `layouts/` folder just to hold styled wrappers with no meaningful structural contract.

## 11. Imports and exports

- use relative imports within the same layout folder
- use the `@/*` alias for cross-folder imports
- keep imports aligned with ownership boundaries
- let consumers import from the layout folder's public API when possible
- avoid deep imports into another layout folder's internals

Good:

```ts
import { SidebarNav } from "@/modules/dashboard/components/sidebar-nav";
import type { LayoutTwoColumnsProps } from "./types";
```

Avoid:

```ts
import { someInternalSlotHelper } from "@/shared/layouts/layout-default/internal-helper";
```

unless both files are part of the same owned layout boundary and the deep import is intentionally internal.

## 12. Testing

Every non-trivial reusable layout should have adjacent tests.

- use Vitest and Testing Library
- keep tests next to the layout they cover
- test the layout contract and rendered regions
- verify `children` and any explicit slots render in the correct places
- test structural behavior, not implementation details

Typical layout tests should cover:

- rendering `children`
- rendering optional regions such as `header`, `sidebar`, or `footer`
- conditional layout branches when the contract supports them
- client/server boundary behavior when relevant

If a layout is extremely small and purely presentational, tests may be light, but reusable structural behavior should still be validated.

## 13. Example patterns

### Good shared layout

```txt
src/shared/layouts/layout-default/
├── layout-default.tsx
├── index.ts
└── types.ts
```

Why it fits:

- shared across unrelated areas
- clearly structural
- owns a small public API

### Good module layout

```txt
src/modules/dashboard/layouts/layout-two-columns/
├── layout-two-columns.tsx
├── layout-two-columns.test.tsx
├── index.ts
└── types.ts
```

Why it fits:

- owned by one feature module
- frames multiple pages in that feature
- not generic enough for `shared`

### Thin route layout file

```txt
src/app/[locale]/(public)/layout.tsx
```

```tsx
import { LayoutDefault } from "@/shared/layouts/layout-default";

import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({
  children,
}: Readonly<LayoutProps>) {
  return <LayoutDefault>{children}</LayoutDefault>;
}
```

Why it fits:

- route-boundary file stays thin
- reusable frame lives in the owning shared folder
- Next.js-specific boundary remains in `app/`

## 14. Final checklist

Before placing code in `layouts`, check:

- does it provide a reusable structural frame around `children`?
- should it live in `layouts` instead of `screens`, `components`, or `app/layout.tsx`?
- is the scope correct: module first, shared only when truly cross-cutting?
- is the App Router `layout.tsx` file staying thin?
- is the folder named after one clear structural role?
- are props explicit and layout-oriented?
- are server/client boundaries kept as low as possible?
- are tests covering the layout contract?
