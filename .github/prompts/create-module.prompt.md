---
name: create-module
description: Create a new feature module with containers, screens, components, and actions
---

# /create-module

Create a new feature module with the standard directory structure.

## Behavioral Mode

You are in **Implementation** phase for module scaffolding.

## Prerequisites

- Verify plan is approved (or this is a simple module creation task)
- Check `src/modules/` for existing patterns

## Input

Module name should be provided as argument:
- Use kebab-case: `user-management`, `order-processing`
- Be specific: `auth`, `dashboard`, `settings`

## Required Output

Create the following structure:

```txt
src/modules/<name>/
├── actions/
├── components/
├── containers/
├── hooks/
├── repositories/
├── schemas/
├── screens/
└── services/
```

Create at least one concrete feature slice instead of empty barrels, for example:

```txt
src/modules/<name>/screens/screen-<name>-index/screen-<name>-index.tsx
src/modules/<name>/screens/screen-<name>-index/types.ts
src/modules/<name>/containers/container-<name>-index/container-<name>-index.tsx
src/modules/<name>/components/section-<name>-list/section-<name>-list.tsx
src/modules/<name>/actions/get-<name>-list-action/get-<name>-list-action.ts
src/modules/<name>/schemas/<name>-list-schema/<name>-list-schema.ts
```

Rules:

- Do not create grouping-folder barrel files such as `actions/index.ts`, `components/index.ts`, or module-level `index.ts` that re-export folders.
- Create scoped `types.ts`, `constants.ts`, or `helpers.ts` only inside concrete folders when needed.
- Keep `helpers.ts` internal (not broadly re-exported).

## Translation Files

Also create translation files:

```txt
src/messages/en/modules/<name>/
├── index.ts
└── components/
    ├── index.ts
    └── section-<name>-list.json

src/messages/th/modules/<name>/
├── index.ts
└── components/
    ├── index.ts
    └── section-<name>-list.json
```

### Translation Template

```json
{
  "title": "<Module Title>",
  "description": "<Module description>"
}
```

## Update Message Barrel Exports

Update `src/messages/en/modules/index.ts` and `src/messages/th/modules/index.ts` to
include the new module. Also update the nested `components/index.ts` files to export
the new leaf JSON file.

## Convention Checks

- Module name: kebab-case
- Follow existing module patterns in `src/modules/`
- Server-first: start with server components, add "use client" only at leaves

## Do Not

- Create modules with generic names like `utils` or `helpers`
- Create grouping-folder barrels
- Add "use client" to initial scaffolding
- Create duplicate modules
