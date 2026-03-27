---
name: Next.js Routing
description: Enforce route taxonomy, URL semantics, layout boundaries, and careful use of advanced App Router features.
applyTo: "apps/web/src/app/**/*,src/app/**/*,next.config.*"
---
# Next.js routing

Treat route design as architecture, not file organization.

Rules:

- design locale-aware routes explicitly; enterprise defaults are `en` and `th` with `en` as the default locale
- canonical external URLs for visible app routes should be locale-prefixed, for example `/en/customers` and `/th/customers`
- use path segments for stable resource identity and hierarchy
- use `searchParams` for filters, sorting, tabs, pagination, and reversible view state
- use route groups for layout and product-area boundaries without leaking those names into URLs
- use lowercase kebab-case for user-facing route segment names
- keep URLs based on domain language, not component names or technical layers
- keep visible application route files under `app/[locale]/...` or `app/(group)/[locale]/...` so the URL layer reflects locale explicitly
- prefer one canonical route for each feature area
- keep reusable path builders in a shared route registry instead of duplicating literals across features
- use route-aware helpers like `PageProps` only when route type generation is already in place; otherwise type page props explicitly
- keep URL parsing and normalization in seams that automated tests can exercise without booting the entire app when practical

Dynamic segments:

- use them only for stable identifiers or intentional workflow state
- justify catch-all routes explicitly
- document whether the segment is tenant-scoped, user-private, or cacheable

Advanced routing:

- do not use parallel routes by default
- do not use intercepting routes by default
- both require explicit planning evidence and verification coverage

Do not:

- create route groups named after teams or technical layers such as `(shared)` or `(components)`
- encode filter or tab state as extra path segments when `searchParams` is the correct model
- mix first-party UI mutations into `api/*` routes when a Server Action is the correct boundary
- leak route-group or slot syntax into shared route helpers or app-level redirects
