---
name: Next.js Route Registry
description: Centralize user-facing path builders and keep internal route syntax out of product code.
applyTo: "apps/web/src/shared/routes/**,src/shared/routes/**,apps/web/src/app/**/*,src/app/**/*"
---
# Next.js route registry

Treat shared route helpers as the source of truth for reusable user-facing URLs.

Rules:

- keep canonical path builders in `shared/routes`
- keep route family directories and files in lowercase kebab-case
- every reusable route helper should expose a `path()` function
- return locale-neutral path bodies only; the canonical external URL must still resolve through the active locale such as `/en/...` or `/th/...`
- keep route groups, slot names, and intercepting syntax out of helper outputs
- use descriptive parameter names like `workspaceSlug`, `customerId`, or `invoiceId`
- when a route is reused across modules, consume the helper instead of duplicating the literal path string

Do not:

- leak `(public)`, `(app)`, `@modal`, `(.)`, or `(..)` into route helper outputs
- hide team names or technical folder names inside user-facing URLs
- scatter the same route literal across multiple modules once a shared route helper exists
