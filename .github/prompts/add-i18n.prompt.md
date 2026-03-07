---
name: add-i18n
description: >-
  Add i18n message files for a component following
  the owning-layer path convention
agent: agent
tools: ['edit/editFiles', 'search/codebase']
argument-hint: >-
  [component-path]
  e.g. modules/profile/components/form-profile
---

# Add i18n messages

Create message files for a component following the owning-layer namespace
convention from AGENTS.md and the auto-loaded messages instruction file.

## Input

`${input}` is the component path relative to `src/`, e.g.
`modules/profile/components/form-profile`.

## Steps

1. Convert path to dot-separated camelCase namespace:
   `modules/profile/components/form-profile` → `modules.profile.components.formProfile`
2. Create JSON files at `src/messages/{locale}/` matching the namespace path,
   for every locale in `src/messages/` (currently `en` and `th`)
3. Use flat key structure with camelCase keys
4. Register in parent `index.ts` barrel files
