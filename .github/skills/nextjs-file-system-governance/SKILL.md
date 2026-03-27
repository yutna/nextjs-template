---
name: nextjs-file-system-governance
description: Keep Next.js file placement, folder shape, and naming deterministic across every feature. Use this during Planning, Implementation, Review, or Migration when consistency matters.
---

# Next.js File System Governance

Use this skill whenever a task creates, moves, renames, or reviews files in the Next.js enterprise profile.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [Next.js file-system instruction](../../instructions/nextjs-file-system.instructions.md)
- [Next.js enterprise design](../../../docs/nextjs-enterprise-workflow-design.md)
- [Next.js file-system playbook](../../../docs/nextjs-enterprise-file-system-playbook.md)

## Core contract

- feature slugs are canonical and stable
- product folders and files use lowercase kebab-case
- route segments use user-facing information architecture, not technical layer names
- feature modules share the same top-level shape
- public barrels are intentional and minimal
- generic catch-all file names are not allowed

## Standard feature shape

```text
src/features/<feature-slug>/
  actions/
  components/
    client/
  constants/
  contracts/
  data/
  policies/
  schemas/
  tests/
  index.ts
```

## Naming matrix

- feature slug: `customers`, `billing-settings`, `orders`
- route family helper: `shared/routes/customers.ts`
- server component file: `customer-empty-state.tsx`
- client leaf file: `customer-filters.tsx` in `components/client/` or `customer-filters.client.tsx`
- action file: `create-customer.action.ts`
- schema file: `customer-form.schema.ts`
- policy file: `can-manage-customers.policy.ts`
- data file: `list-customers.query.ts`, `customer.repository.ts`
- contract file: `customer-summary.contract.ts`
- constants file: `customer-status.constants.ts`
- test file: `create-customer.action.test.ts`

Exported symbols can stay PascalCase when appropriate. File names should not.

## Review checklist

- does the feature use the standard top-level folders only?
- do file names describe role and domain instead of vague utility buckets?
- does the route area align with the feature slug and route-registry family?
- are nested barrels avoided unless the convention explicitly allows them?
- does anything belong in `shared/` only after repeated cross-feature demand?

## Do not

- create `helpers/`, `utils/`, `common/`, or `lib/` as escape hatches inside features
- let route files proxy into technical folder names that do not match the domain shape
- rename by personal preference when the canonical slug already exists
