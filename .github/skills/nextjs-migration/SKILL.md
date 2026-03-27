---
name: nextjs-migration
description: Inventory and sequence legacy Next.js migrations into the enterprise App Router profile. Use this during Discovery or Planning for upgrades from Pages Router or client-heavy architectures.
---

# Next.js Migration

Use this skill for legacy Next.js migrations.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [Next.js enterprise design](../../../docs/nextjs-enterprise-workflow-design.md)
- [workflow state](../../workflow-state.json)
- [migration tracker template](../../../docs/migrations/MIGRATION.template.md)

## Inventory checklist

- Pages Router routes
- data fetching methods
- API Routes and Route Handlers
- custom server or webpack behavior
- global client boundaries
- i18n libraries, locale routing, and translation asset layout
- auth and session surfaces
- env usage
- caching behavior
- test coverage and parity gaps
- testability debt caused by route-shell logic, wide client islands, or unisolated side effects

## Output checklist

- route-by-route migration map
- codemod-safe work
- manual redesign work
- rollout order
- rollback plan
- parity verification plan
- migration tracker sections updated or proposed
- locale and message-parity migration notes
- target seams that should become easier to cover with automated tests after migration

## Do not

- skip the inventory
- mix target-state architecture with current-state exceptions
- start implementation before the migration sequence is explicit
