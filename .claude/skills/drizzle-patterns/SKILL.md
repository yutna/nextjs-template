---
name: drizzle-patterns
description: This skill should be used when working with database, Drizzle ORM, entities, schemas, migrations, and seeds. It provides Rails-style DB conventions, local sqlite/libSQL file defaults, and Effect-friendly data patterns.
---

# Drizzle Patterns Skill

Drizzle is the database ORM for this project.
All entities live in `src/shared/entities/`.

For the runnable template scaffold and command flow, see `docs/db/database-workflow.md`.

## Database Workflow (Local File Default)

These conventions apply to every DB backend.
The `local/*.sqlite` path defaults apply only when using file-based local DBs.

Use this local-first structure:

```txt
src/shared/db/
├── client.ts
├── schema.ts
├── local/
│   ├── development.sqlite
│   ├── test.sqlite
│   └── production.sqlite   # local fallback only
├── migrations/
└── seeds/
```

Environment URL defaults:

- development: `file:src/shared/db/local/development.sqlite`
- test: `file:src/shared/db/local/test.sqlite`
- production local fallback: `file:src/shared/db/local/production.sqlite`

If production uses remote Turso/libSQL, keep production URL in env and do not reuse local dev/test files.

## Test DB Isolation

Use a deterministic reset strategy for tests. Choose one:

1. Per-test transaction + rollback
2. Truncate/reset all mutable tables between tests
3. Per-run isolated DB file (recommended default for sqlite/libSQL local test)

Minimum expectation:

- tests run against dedicated test DB target
- test setup resets state deterministically before assertions

Recommended repository helpers:
- `src/shared/lib/db-isolation/db-isolation.ts`
- `src/shared/lib/db-isolation/types.ts`
- `src/test/setup-db.ts`

## Canonical Starter Entity

The template currently uses `src/shared/entities/app-setting/` as the starter entity example.

Use it as a replacement seam, not as a production domain recommendation.

## Ownership Boundaries

- DB runtime/config lives in `src/shared/db/`
- Entity schemas live in `src/shared/entities/`
- Modules must not own migration/seed entrypoints
- Module repositories consume shared DB runtime and shared entities

## Entity Structure

```txt
src/shared/entities/
├── user/
│   ├── index.ts
│   ├── user.ts
│   ├── types.ts
│   └── relations.ts
└── ...
```

## Schema Example (SQLite/libSQL)

```typescript
// src/shared/entities/app-setting/app-setting.ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const appSettings = sqliteTable("app_settings", {
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  description: text("description"),
  key: text("key").primaryKey(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  value: text("value").notNull(),
});
```

## Types Example

```typescript
// src/shared/entities/app-setting/types.ts
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { appSettings } from "./app-setting";

export type AppSetting = InferSelectModel<typeof appSettings>;
export type NewAppSetting = InferInsertModel<typeof appSettings>;
```

## DB Client Example (libSQL)

```typescript
// src/shared/db/client.ts
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { resolveDatabaseUrl } from "./resolve-database-url";
import * as schema from "./schema";

const nodeEnv =
  process.env.NODE_ENV === "production"
    ? "production"
    : process.env.NODE_ENV === "test"
      ? "test"
      : "development";

const databaseUrl = resolveDatabaseUrl({
  databaseUrl: process.env.DATABASE_URL,
  databaseUrlProduction: process.env.DATABASE_URL_PRODUCTION,
  databaseUrlTest: process.env.DATABASE_URL_TEST,
  nodeEnv,
});

const client = createClient({ url: databaseUrl });

export const db = drizzle(client, { schema });
```

## Drizzle Config Example

```typescript
// drizzle.config.ts
import type { Config } from "drizzle-kit";

import { resolveDatabaseUrl } from "./src/shared/db/resolve-database-url";

const nodeEnv =
  process.env.NODE_ENV === "production"
    ? "production"
    : process.env.NODE_ENV === "test"
      ? "test"
      : "development";

const databaseUrl = resolveDatabaseUrl({
  databaseUrl: process.env.DATABASE_URL,
  databaseUrlProduction: process.env.DATABASE_URL_PRODUCTION,
  databaseUrlTest: process.env.DATABASE_URL_TEST,
  nodeEnv,
});

export default {
  dbCredentials: { url: databaseUrl },
  dialect: "sqlite",
  out: "./src/shared/db/migrations",
  schema: "./src/shared/db/schema.ts",
} satisfies Config;
```

## Repository Query Pattern (Effect)

```typescript
import { and, desc, eq, like } from "drizzle-orm";
import { Effect } from "effect";

import { db } from "@/shared/db";
import { users } from "@/shared/entities/user";

export function findActiveUsers(search?: string) {
  return Effect.tryPromise({
    catch: (error) => new DatabaseError(error),
    try: () =>
      db.query.users.findMany({
        orderBy: [desc(users.createdAt)],
        where: and(
          eq(users.isActive, true),
          search ? like(users.name, `%${search}%`) : undefined,
        ),
      }),
  });
}
```

## Migration Workflow

Generate migration:

```bash
npm run db:generate
```

Apply migration:

```bash
npm run db:migrate
```

Apply migration to test DB:

```bash
npm run db:migrate:test
```

Reset and migrate the test DB:

```bash
npm run db:prepare:test
```

## Seeds

Seeds live in `src/shared/db/seeds/` and should be deterministic.

```txt
src/shared/db/seeds/
└── index.ts
```

The committed template seed currently inserts the canonical `app_settings.site_name` row.

## DB Task Checklist (Required)

For every DB-related task:

1. Identify target env (`dev`/`test`/`prod`)
2. Document migration impact + rollback strategy
3. Document seed impact + determinism expectations
4. Run quality gates (`npm run check-types`, `npm run lint`, `npm test`)
5. Verify tests point to the intended DB URL/file
6. Verify test DB reset strategy is deterministic

## Rails-Style Process Discipline

This repository follows Rails-style database workflow expectations even though the stack is Next.js + Drizzle:

1. Schema ownership stays centralized in shared DB and entity seams
2. Migrations are ordered, committed artifacts, not ad hoc local patches
3. Seeds are deterministic and environment-aware
4. Repositories own data access; services own orchestration; migrations and seeds do not leak into feature modules
5. Planning must include lifecycle impact, rollback, and data safety before implementation starts

When a task exposes DB process confusion, fix the workflow and ownership boundaries before adding more schema surface.
