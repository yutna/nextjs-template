---
name: project-infrastructure
description: >
  Project conventions for config, constants, providers, hooks, contexts, and utils.
  Use when creating, modifying, or reviewing files in shared/config/, any constants/,
  any providers/, any hooks/, any contexts/, or any utils/ directories. Covers
  validated environment access, standalone config files, provider-context separation,
  hook extraction patterns, and utility ownership.
---

# Project Infrastructure Skill

This skill covers six cross-cutting infrastructure concerns in the repository:
config, constants, providers, hooks, contexts, and utils. Each concern has a
dedicated folder convention, ownership rules, and placement guidelines.

## Concern Areas Overview

### Config (`src/shared/config`)

The config folder holds application-wide and framework-facing configuration that
shapes how the app runs. This includes validated environment access, font setup,
i18n routing, request config, and formatting definitions.

Key rules:

- Config files must be declarative and easy to scan
- Use standalone files for single-file concerns (e.g., `env.ts`, `fonts.ts`)
- Use nested folders for multi-file concerns (e.g., `i18n/routing.ts`,
  `i18n/formats.ts`)
- Do not create `src/shared/config/index.ts`
- Prefer direct imports from the actual config file
- Centralize all environment variable access through `env.ts`; never read
  `process.env` elsewhere
- Add `import "server-only"` when a config file is server-only
- Allow default exports only when a framework explicitly requires them

Boundary: if the file performs behavior, orchestration, or integration work, it
belongs in `lib/`. If it stores fixed domain values, it belongs in `constants/`.

### Constants (`src/shared/constants`, `src/modules/<module>/constants`)

Constants folders hold static values with broad ownership that are intentionally
shared across a module or app area.

Key rules:

- Values must be static and behavior-free: literal arrays, objects, strings,
  numbers, maps
- Use `SCREAMING_SNAKE_CASE` for exported constant names
- Use `as const` when literal inference helps derive narrow unions
- Prefer standalone files named by concern, not folders per constant
- Do not create barrel index files for constants directories
- Keep constants flat and boring: no functions, no lazy init, no env access, no
  side effects

Dedicated vs colocated:

- Use `constants/` when ownership is broader than one leaf folder
- Use colocated `constants.ts` inside a leaf folder when the value only supports
  that single component, hook, or lib module

### Providers (`src/shared/providers`, `src/modules/<module>/providers`)

Provider folders hold components that wrap `children` in one or more React
context providers, exposing subtree-level state or dependencies.

Key rules:

- One provider per leaf folder with its own `index.ts` and `types.ts`
- Providers are client-side boundaries: use `"use client"` where required
- Pass server-prepared data into providers through explicit typed props
- Keep one clear responsibility per provider
- Do not create parent barrel files

The provider depends on the context. Consumers depend on hooks. The recommended
flow is: `contexts/` → `providers/` → `hooks/`.

### Hooks (`src/shared/hooks`, `src/modules/<module>/hooks`)

Hooks folders hold custom React hooks that package reusable client-side behavior
behind a stable `use*` API.

Key rules:

- One hook per leaf folder with `index.ts`, implementation file, optional
  `types.ts`, and adjacent tests
- Always mark implementation files with `"use client"`
- Prefix all public hooks with `use`
- Keep hook APIs small, predictable, and explicit
- Prefer object returns for multi-value hooks
- Move pure non-React logic into `utils/` or local helpers
- Do not create parent barrel files

Placement: module-level first, promote to shared only when multiple unrelated
modules need the same hook and the API is generic.

### Contexts (`src/shared/contexts`, `src/modules/<module>/contexts`)

Contexts folders hold the React context object and its context-owned value
contracts. Providers and consumer hooks live elsewhere.

Key rules:

- One context per leaf folder
- Name the context file `<concern>-context.ts`
- Keep only the context object and its types in the folder
- Providers go in `providers/`; consumer hooks go in `hooks/`
- Mark context files with `"use client"` when required
- Keep the context value shape explicitly typed in local `types.ts`
- Do not create parent barrel files

Design: prefer multiple focused contexts over one oversized global context. Use
context only when props or a plain hook are no longer a good fit.

### Utils (`src/shared/utils`, `src/modules/<module>/utils`)

Utils folders hold small, framework-light utilities that are easy to reuse and
test: formatting, transforms, guards, parsing, normalization.

Key rules:

- One utility per folder with implementation, tests, and `index.ts`
- Prefer pure functions with no hidden side effects
- Type all parameters and return values; prefer `unknown` over `any`
- Use descriptive verb-based names: `formatCurrency`, `isNonEmptyString`,
  `clampNumber`
- Every non-trivial utility must have adjacent tests covering happy paths and
  edge cases
- Do not create parent barrel files

Boundary: if the code owns app behavior, talks to external systems, or encodes
domain workflows, it belongs in `lib/`, not `utils/`.

## Context-Provider-Hook Separation

The three concerns form a dependency chain:

```text
contexts/  →  providers/  →  hooks/
(primitive)   (exposes)      (consumes)
```

- **Context** defines the `createContext` object and value contract
- **Provider** wraps `children` in the context provider, accepting explicit props
- **Hook** wraps `useContext` to give consumers a clean API

Never put provider components or consumer hooks inside `contexts/`. Never put
context definitions inside `providers/` or `hooks/`.

## Scope and Placement Rules

All six concerns follow the same placement principle:

1. Start at the narrowest valid scope (module-level)
2. Promote to `shared/` only when multiple unrelated modules need it
3. Promote criteria: generic name, cross-module usage, shared ownership improves
   clarity

## File and Folder Conventions

All six concerns share these structural rules:

- Kebab-case for all files and folders
- One public concern per leaf folder
- Leaf-level `index.ts` for each folder
- Colocate `types.ts` when the concern owns reusable contracts
- Tests adjacent to the implementation they cover
- No parent barrel files for any of the six concern directories
- No `../` imports; use `@/` for cross-folder, `./` for same-folder

## Common Mistakes

- Reading `process.env` outside of `src/shared/config/env.ts`
- Putting functions or logic in `constants/` files
- Mixing context definition, provider, and consumer hook in one file
- Moving feature-specific code to `shared/` prematurely
- Creating barrel `index.ts` at the parent directory level
- Adding `"use client"` to config or constants files
- Putting pure non-React helpers in `hooks/` instead of `utils/`
- Using vague names like `helpers.ts`, `common.ts`, `utils.ts`, `shared.ts`
- Growing a single provider or context into a dumping ground for unrelated
  concerns

## Reference

See `references/detailed-guides.md` for the full detailed guides covering every
rule, example, and checklist for all six concern areas.
