---
name: create-component
description: >-
  Create a presenter component with types, barrel export,
  and test file
agent: agent
tools: ['edit/editFiles', 'search/codebase']
argument-hint: >-
  [module-or-shared] [component-name]
  e.g. profile form-profile
---

# Create presenter component

Create a stateless presenter component following AGENTS.md component conventions
and the auto-loaded components instruction file.

## Input

`${input}` contains two space-separated values:

1. **owner** — module name or `shared`
2. **component-name** — kebab-case name

If owner is `shared`, place under `src/shared/components/${component}/`.
Otherwise place under `src/modules/${owner}/components/${component}/`.

## Files to create

1. `${component}.tsx` — named export, server-first, Chakra UI, `Readonly<Props>`
2. `types.ts` — props interface
3. `index.ts` — barrel re-export of component and type
4. `${component}.test.tsx` — render test using `renderWithProviders`
5. i18n messages (if user-facing text) — both `en` and `th` locales
