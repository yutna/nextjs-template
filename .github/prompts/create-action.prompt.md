---
name: create-action
description: >-
  Create a server action with schema, input validation,
  and test file
agent: agent
tools: ['edit/editFiles', 'search/codebase']
argument-hint: >-
  [module-name] [action-name]
  e.g. profile update-profile
---

# Create server action

Create a server action with Zod input schema following AGENTS.md server-actions
conventions and the auto-loaded server-actions instruction file.

## Input

`${input}` contains two space-separated values:

1. **module-name** — kebab-case feature module name
2. **action-name** — kebab-case action name

## Files to create

1. `src/modules/${module}/schemas/${action}-input/` — Zod schema with
   `${action}-input.schema.ts`, `types.ts`, `index.ts`
2. `src/modules/${module}/actions/${action}-action/` — server action with
   `"use server"`, `actionClient` or `authActionClient`, `.inputSchema()`,
   `index.ts`
3. `${action}-action.test.ts` — test file adjacent to the action
