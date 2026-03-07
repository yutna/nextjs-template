---
name: scaffold-page
description: >-
  Create a complete page with screen, container, and
  component following project architecture
agent: agent
tools: ['edit/editFiles', 'search/codebase']
argument-hint: >-
  [module-name] [page-name] [route-group]
  e.g. profile settings private
---

# Scaffold page chain

Create the full page → screen → container → component chain following
AGENTS.md feature flow and matching instruction files (auto-loaded per file).

## Input

`${input}` contains three space-separated values:

1. **module-name** — kebab-case feature module name
2. **page-name** — kebab-case page name
3. **route-group** — `public` or `private`

## Files to create

1. `src/app/[locale]/(${route-group})/${page-name}/page.tsx` — thin,
   `import "server-only"`, `export default function Page`, returns one screen
2. `src/modules/${module}/screens/screen-${page}/` — server-first, composes
   containers only, with `types.ts` and `index.ts`
3. `src/modules/${module}/containers/container-${page}/` — bridge layer,
   server-first unless client needed, with `types.ts` and `index.ts`
4. `src/modules/${module}/components/${page}/` — stateless presenter with
   `types.ts`, `index.ts`, and `${page}.test.tsx`
