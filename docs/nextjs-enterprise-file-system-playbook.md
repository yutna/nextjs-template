# Next.js Enterprise File System Playbook

This profile treats folder structure and file naming as governed architecture.

## Goal

Every feature should look predictable enough that an AI agent or human reviewer can infer responsibility from the path alone.

## Canonical roots

- `src/app/` or `apps/web/src/app/` for App Router entry files only
- `src/features/` or `apps/web/src/features/` for domain feature modules
- `src/shared/` or `apps/web/src/shared/` for truly cross-feature code
- `src/server/` or `apps/web/src/server/` for server-wide infrastructure when it does not belong to one feature

## Feature module contract

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

Top-level feature folders are fixed on purpose. They reduce drift and keep code review fast.

## Naming rules

- product folders and file names use lowercase kebab-case
- framework-reserved route files keep framework names such as `page.tsx`, `layout.tsx`, `loading.tsx`, and `route.ts`
- exported TypeScript symbols may use PascalCase, but file names should not
- feature slug, route family, and message namespace should align whenever practical
- use role-specific suffixes when they improve clarity: `.action`, `.schema`, `.policy`, `.contract`, `.query`, `.constants`

## Names that should not appear in feature code

- `helpers`
- `utils`
- `common`
- `lib`
- `misc`
- `temp`
- `types` as a dumping ground

These names hide responsibility and encourage AI to pile unrelated logic together.

## Barrel rule

- allow `index.ts` at the feature root for intentional public exports
- allow `index.ts` at route-registry family boundaries
- avoid nested barrels inside feature internals

## Route and shared-surface alignment

- route segments should reflect user-facing information architecture
- shared route helpers should mirror canonical route families
- move code into `shared/` only after repeated demand across features
- do not let technical folder names leak into URLs or route-helper outputs

## Review expectation

- reviewer should flag structure drift as a real maintainability issue
- planner should record the canonical feature slug before implementation starts
- migrator should inventory naming drift when moving legacy code into the new profile
