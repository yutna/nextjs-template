# Database Workflow

This template ships with a minimal real Drizzle + libSQL/sqlite scaffold.
The goal is to provide a truthful starting point, not a prebuilt application schema.

## What Is Included

- `drizzle.config.ts` for schema discovery and migration generation
- `src/shared/db/client.ts` for the runtime Drizzle client
- `src/shared/db/schema.ts` as the schema entrypoint for Drizzle
- `src/shared/db/migrations/` for committed migration files
- `src/shared/db/seeds/index.ts` for deterministic seed data
- `src/shared/db/local/` for local sqlite database files
- `src/shared/lib/db-isolation/` for test DB reset helpers

## Canonical Example Entity

The template includes `src/shared/entities/app-setting/` as the smallest practical entity example.

Why this entity:

- generic enough for any project
- demonstrates a stable primary key shape
- works as a realistic seed target
- easy to replace once a real domain model exists

The seeded example row is:

- key: `site_name`
- value: `Vibe Next Template`

## Local Workflow

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:prepare:test
```

## Rails-Style Process Discipline

- Keep entities in `src/shared/entities/`; feature modules do not own migrations or schema entrypoints
- Commit ordered migrations instead of relying on local-only schema drift
- Keep repositories responsible for Drizzle/data access and services responsible for orchestration
- Keep seeds deterministic and safe to rerun
- For every DB change, planning and verification must record target env, migration impact, rollback strategy, seed impact, and test isolation expectations

## Environment Defaults

- development: `file:src/shared/db/local/development.sqlite`
- test: `file:src/shared/db/local/test.sqlite`
- production fallback: `file:src/shared/db/local/production.sqlite`

Production may use a remote libSQL/Turso URL instead of the local fallback.

## Test Database Flow

`npm run db:prepare:test` does two things:

1. removes the current local test sqlite file
2. re-applies migrations with `NODE_ENV=test`

`src/shared/lib/db-isolation/` remains the seam for deterministic test setup in Vitest.

## Replacing The Example Entity

When a real app module arrives, replace `app-setting` instead of layering more placeholder entities on top.

Recommended sequence:

1. create the real entity under `src/shared/entities/`
2. update `src/shared/db/schema.ts`
3. update `src/shared/db/seeds/index.ts`
4. regenerate the migration with `npm run db:generate`
5. review migration impact and rollback before applying it
6. run `npm run db:migrate && npm run db:seed`
7. run `npm run db:prepare:test`
8. run `npm run check-types && npm run lint && npm test`
