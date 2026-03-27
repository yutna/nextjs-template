---
name: nextjs-route-registry
description: Design and maintain a canonical shared route-helper registry for Next.js applications. Use this when routes are reused across modules or when URL semantics need to stay consistent.
---

# Next.js Route Registry

Use this skill when building or reviewing shared path builders.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [Next.js enterprise design](../../../docs/nextjs-enterprise-workflow-design.md)
- [Next.js route-registry instruction](../../instructions/nextjs-route-registry.instructions.md)

## Goal

Keep user-facing paths consistent and keep internal App Router syntax out of
feature code.

Route helpers may stay locale-neutral, but canonical external URLs should still
resolve through the locale layer, for example `/en/customers` and
`/th/customers`.

## Standard shape

```ts
routes.app.customers.path()
routes.app.customers.detail.path(customerId)
routes.public.signIn.path()
```

## Rules

- organize helpers by route family
- expose `path()` for every reusable route node
- keep helpers locale-neutral
- use descriptive parameter names
- keep route family file names in lowercase kebab-case
- keep route groups and slot names out of outputs
- aggregate the public route API from top-level `index.ts` files

## Implementation checklist

- canonical URL chosen
- helper path matches the approved route design
- dynamic parameter names are explicit
- route is added to the family index export
- consuming code uses the helper instead of duplicating the literal
- file and directory names stay aligned with the canonical route family slug

## Do not

- return `/(public)/...` or `@modal/...` from route helpers
- use generic parameter names like `id` when the domain name is known
- create a shared helper for a route that has not been designed yet
