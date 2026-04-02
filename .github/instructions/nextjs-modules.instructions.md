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
└── index.ts       # Barrel export
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
- `index.ts` (barrel export)
- `types.ts` (if types exist)
- `*.test.ts` (tests required)
- `*.stories.tsx` (components only)

## Server-First Rules

- screens/ and components/ are Server Components
- containers/ use "use client" when needed
- Never "use client" in screens/

## Import Rules

- Same folder: `./` relative
- Cross folder: `@/` alias only
- Never: `../` relative
- Never: Cross-module imports (use shared/)
