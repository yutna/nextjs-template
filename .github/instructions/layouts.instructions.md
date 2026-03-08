# Reusable Layouts

applyTo: src/shared/layouts/**, src/modules/**/layouts/**

## Purpose

Reusable layout components provide structural framing that wraps page
content. They are consumed by App Router `layout.tsx` files or by screens
that need shared page chrome.

Do not confuse with `layout.tsx` (App Router boundary files). Those are
thin adapters that delegate to reusable layouts defined here.

## Scope and placement

- **Module-first**: place in `src/modules/<module>/layouts/` when owned
  by one feature
- **Shared**: promote to `src/shared/layouts/` when used across modules
  or as app-wide structural frames

## Folder structure

Each reusable layout lives in its own leaf folder prefixed with `layout-`:

```text
src/shared/layouts/layout-two-columns/
├── layout-two-columns.tsx
├── layout-two-columns.test.tsx
├── index.ts
└── types.ts
```

Rules:

- One public layout per folder
- Folder and main file share the same `layout-{name}` name
- Leaf-level `index.ts` for the public API
- Colocate `types.ts` when the layout owns prop contracts
- Tests adjacent to the layout
- No parent barrel files for `layouts/`

## Naming

Files and folders use kebab-case with `layout-` prefix:

- `layout-two-columns`, `layout-sidebar`, `layout-dashboard`

Exported symbols use PascalCase with `Layout` prefix:

- `LayoutTwoColumns`, `LayoutSidebar`, `LayoutDashboard`

Named exports only — no default exports.

## Props

- Accept `children` as the primary content slot
- Use `Readonly<>` for prop types
- Keep props focused on structural concerns (sidebar content, header slot)
- Do not accept business data or feature-specific props

```ts
interface LayoutTwoColumnsProps {
  children: ReactNode;

  sidebar?: ReactNode;
}
```

## Server-first default

- Keep as server components by default
- Add `"use client"` only when the layout needs interactive behavior
- Add `import "server-only";` when the layout must never enter the
  client bundle

## Consumption

App Router `layout.tsx` delegates to reusable layouts:

```tsx
import { LayoutDashboard } from "@/shared/layouts/layout-dashboard";

export default function Layout({ children }: Readonly<LayoutProps>) {
  return <LayoutDashboard>{children}</LayoutDashboard>;
}
```

## Checklist

- [ ] Provides structural framing, not feature logic
- [ ] Scope correct: module-first, shared only when cross-cutting
- [ ] Folder prefixed with `layout-`
- [ ] Exported symbol uses `Layout` prefix
- [ ] Accepts `children` as primary content slot
- [ ] Server-first by default
- [ ] Named exports only
- [ ] No parent barrel files
