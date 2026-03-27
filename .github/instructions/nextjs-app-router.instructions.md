---
name: Next.js App Router
description: Keep App Router files thin, intentional, and aligned with route-shell responsibilities.
applyTo: "apps/web/src/app/**/*,src/app/**/*"
---
# Next.js App Router

Route files are composition shells.

Allowed responsibilities:

- segment structure and metadata
- layout composition
- calling feature-level server loaders or presenters
- wiring forms and Server Actions into views
- segment-scoped loading, error, and not-found UX
- redirects and route-entry decisions that belong to the segment itself
- delegating behavior into narrower modules that remain practical to test

Segment naming rules:

- user-facing route segments should use lowercase kebab-case
- dynamic segments should use descriptive bracket names such as `[customerId]` or `[workspaceSlug]`
- route groups and slots may use framework syntax, but the descriptive part should still stay lowercase and intentional

Do not:

- inline low-level data access
- parse env directly
- hide business rules in route files
- trap logic in route shells when it could live in a smaller testable module
- spread one feature across unrelated route areas
- add route files that only proxy through to unrelated technical folders

Special files must be intentional:

- `layout.tsx` for shared shell boundaries
- `template.tsx` only when remount behavior is truly required
- `loading.tsx` only for segment-scoped suspense UX
- `error.tsx` only for segment-scoped recovery UX
- `not-found.tsx` only when the segment has a distinct not-found state
- `default.tsx` only for approved parallel-route fallbacks

Normal `page.tsx` files should remain server-first and should not become wide
client boundaries.
