---
applyTo: "src/shared/**"
---
# Shared Directory Conventions

## Structure

```
shared/
├── db/            # Drizzle client, migrations
├── entities/      # ALL Drizzle schemas (never in modules)
├── factories/     # Test data factories
├── services/      # Shared services (auth, email)
├── middleware/    # Request middleware
├── jobs/          # Job infrastructure
├── policies/      # Shared authorization
├── presenters/    # Shared presenters
├── components/    # Shared UI components
├── hooks/         # Shared hooks
├── lib/           # Domain implementations
├── providers/     # App-wide providers
├── schemas/       # Shared Zod schemas
├── types/         # Cross-cutting types
└── utils/         # Pure utility functions
```

## Shared-Only Directories

These exist ONLY in shared/, never in modules:
- `db/` - Single database connection
- `entities/` - All Drizzle schemas
- `middleware/` - Request interceptors
- `queue/` - Queue utilities

## Entities

All database entities go in `shared/entities/<name>/`:

```
shared/entities/user/
├── index.ts        # Barrel export
├── user.ts         # Drizzle schema
├── types.ts        # Inferred types
├── relations.ts    # (optional) Drizzle relations
├── hooks.ts        # (optional) Entity hooks
└── scopes.ts       # (optional) Query scopes
```

## Import Rules

- Modules import from shared via `@/shared/`
- Shared never imports from modules
- No barrel re-exports (import directly from folders)
