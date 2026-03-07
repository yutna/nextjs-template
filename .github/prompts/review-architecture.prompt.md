---
name: review-architecture
description: >-
  Review staged or recent changes against project
  architecture conventions
agent: ask
---

# Review architecture compliance

Examine staged or recent changes and report any
violations of the project architecture conventions.

## Steps

1. Collect the diff to review:

   ```bash
   git diff --staged
   ```

   If nothing is staged, fall back to:

   ```bash
   git diff
   ```

1. Check every changed file against the rules below.
   Report **only genuine violations** — do not flag
   stylistic preferences that the rules do not cover.

## Checklist

### Folder ownership

- Feature code lives in `src/modules/<module>/`
- Cross-cutting code lives in `src/shared/`
- `src/app/` files stay thin route entries
- No cross-module imports between modules

### Server-first compliance

- Components are server components by default
- `"use client"` appears only when hooks or browser
  APIs require it
- `page.tsx` files include `import "server-only"`
- Data loading happens on the server when possible

### Import patterns

- `@/` alias for cross-folder imports
- No `../` parent directory imports
- Sort order: side-effect, external, internal `@/`,
  local `./`, then `import type`

### Naming conventions

- Files and folders use **kebab-case**
- React components use **PascalCase**
- Functions and variables use **camelCase**
- Constants use **SCREAMING_SNAKE_CASE**

### Export style

- Named exports by default
- Default exports only where Next.js requires them
  (`page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`)

### Layer boundaries

- Screens compose containers only
- Containers are the bridge between logic and UI
- Components are stateless presenters
- One `page.tsx` returns exactly one screen

## Output format

List each violation with:

1. File path and line number
1. Rule that was violated
1. Suggested fix

If no violations are found, confirm the changes comply.
