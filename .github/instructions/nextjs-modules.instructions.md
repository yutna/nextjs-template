---
applyTo: "src/modules/**"
---
# Module Conventions

## Directory Structure

Each module follows this structure:

```
<module>/
├── actions/       # Server actions (next-safe-action + Zod)
├── api/           # Route handlers (external endpoints)
├── services/      # Business logic (Effect)
├── repositories/  # Data access (Effect + Drizzle)
├── jobs/          # Background jobs (Trigger.dev)
├── policies/      # Authorization logic
├── schemas/       # Zod schemas
├── forms/         # Complex form handling
├── presenters/    # Entity-to-JSON transformers
├── components/    # UI components (mostly server)
├── containers/    # Logic binding (client when needed)
├── screens/       # Page-level composition (server)
├── hooks/         # Custom hooks (client)
└── index.ts       # Optional module entrypoint (avoid broad re-export barrels)
```

## Naming Patterns

| Type | Pattern | Example |
|------|---------|---------|
| Component | `<semantic>-<name>/` | `form-user-profile/` |
| Container | `container-<name>/` | `container-user-list/` |
| Screen | `screen-<name>/` | `screen-dashboard/` |
| Service | `<name>-service/` | `create-user-service/` |
| Repository | `<name>-repository/` | `user-repository/` |
| Action | `<name>-action/` | `update-user-action/` |

## Required Files

Every folder needs:
- `index.ts` only when required by local lint/consumption pattern
- `types.ts` (if types exist)
- `*.test.ts` (tests required)
- `*.stories.tsx` (components only)

Do not create grouping-folder barrels such as:
- `actions/index.ts`
- `services/index.ts`
- `repositories/index.ts`

Prefer direct imports from concrete feature folders/functions.

## Server-First Rules

- screens/ and components/ are Server Components
- containers/ use "use client" when needed
- Never "use client" in screens/

## Import Rules

- Same folder: `./` relative
- Cross folder: `@/` alias only
- Never: `../` relative
- Never: Cross-module imports (use shared/)

## Additional Hard Conventions

- Prefer named `function` declarations for named functions; use arrows only when contextually required
- Never inline param type literals in signatures; extract to `types.ts`
- Prefer direct React type imports (e.g. `import type { ChangeEvent } from "react"`)
- Local component state must be a single object `useImmer({ ... })` store
- Deprecated APIs (especially Zod deprecations) must be removed immediately
