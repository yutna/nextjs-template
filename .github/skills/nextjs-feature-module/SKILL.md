---
name: nextjs-feature-module
description: Standardize Next.js feature folders so every module has the same responsibilities and shape. Use this during Planning, Implementation, or Review for feature work.
---

# Next.js Feature Module

Use this skill when designing or reviewing feature structure.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [Next.js enterprise design](../../../docs/nextjs-enterprise-workflow-design.md)
- [Next.js file-system governance skill](../nextjs-file-system-governance/SKILL.md)
- [Next.js i18n skill](../nextjs-i18n/SKILL.md)

## Standard shape

```text
src/features/<feature>/
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

## Responsibility rules

- `actions/`: Server Actions and mutation orchestration
- `components/`: server-rendered views and presenters
- `components/client/`: narrow interactive islands
- `constants/`: immutable lookup tables and feature-local literals
- `contracts/`: public DTOs and typed boundaries
- `data/`: server-only integrations and queries
- `policies/`: authorization and decision rules
- `schemas/`: zod validation
- `tests/`: feature-local tests
- visible feature copy should live in the feature namespace of the message tree, not inline in components
- Chakra/Ark/Zag-backed primitive logic should stay close to the client leaf that owns the interaction

## Naming rules

- feature root uses a canonical lowercase kebab-case slug
- product files use lowercase kebab-case even when exported symbols use PascalCase
- use role-specific file names such as `create-customer.action.ts`, `customer-form.schema.ts`, and `can-manage-customers.policy.ts`
- reserve `index.ts` for the feature root public barrel only
- do not introduce generic file or folder names such as `utils`, `helpers`, `common`, or `lib`

## Review checklist

- business logic is not trapped in route shells
- client code is minimal and isolated
- low-level data access is not mixed into presentation files
- exports are intentional and stable
- folder names and file names follow the canonical feature grammar

## Do not

- create one-off folder structures per feature
- dump all logic into `lib/`
- mix unrelated features in the same module
- scatter nested barrels or vague utility files through feature internals
