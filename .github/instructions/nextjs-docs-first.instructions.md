---
name: Next.js Docs First
description: Require local Next.js context, official behavior, and repository topology checks before making framework decisions.
applyTo: "apps/web/**/*,src/**/*,next.config.*,package.json,AGENTS.md"
---
# Next.js docs first

When the repository uses the Next.js enterprise profile:

- confirm the application root before editing: `apps/web/src` for monorepos, `src` for single-app repos
- treat the App Router as the default runtime model for greenfield work
- consult repository-local instructions, skills, and workflow state before inventing framework behavior
- prefer project-local patterns and profile rules over generic Next.js habits
- if framework behavior is ambiguous, verify with official Next.js guidance before making architecture decisions

Do not:

- guess where route, feature, or shared code belongs
- introduce Pages Router files in a greenfield App Router task
- assume client execution is acceptable just because React supports it
