---
name: Next.js File System Governance
description: Enforce deterministic folder structure, file naming, and export boundaries for the Next.js enterprise profile.
applyTo: "apps/web/src/**/*,src/**/*"
---
# Next.js file system governance

Treat file placement and naming as part of the architecture contract.

Rules:

- use lowercase kebab-case for product folders and file names unless the framework requires a reserved name
- keep each feature under a canonical slug that matches the route family, route-registry family, and i18n namespace when practical
- feature modules may only introduce these top-level folders: `actions`, `components`, `constants`, `contracts`, `data`, `policies`, `schemas`, `tests`
- keep the public feature barrel at the feature root only: `src/features/<feature>/index.ts`
- use role-specific file names such as `create-order.action.ts`, `order-form.schema.ts`, `can-manage-orders.policy.ts`, or `customer-summary.contract.ts`
- keep client leaves under `components/client/` or use a `.client.tsx` suffix when exceptional colocated client files are justified
- keep shared route helper files under `shared/routes/` with kebab-case family names and intentional `index.ts` exports only at route-family boundaries

Do not:

- invent one-off top-level folders such as `helpers`, `utils`, `lib`, or `common` inside feature modules
- use generic product file names such as `utils.ts`, `helpers.ts`, `common.ts`, `types.ts`, or `temp.ts`
- use PascalCase or camelCase product file names in `src/features`, `src/shared/routes`, or App Router segment folders
- scatter nested `index.ts` barrels through feature internals
