---
name: drizzle-patterns
description: This skill should be used when working with database, Drizzle ORM, entities, schemas, migrations, and seeds. It provides Rails-style DB conventions, local sqlite/libSQL file defaults, and Effect-friendly data patterns.
---

# Drizzle Patterns Skill

Drizzle is the database ORM for this project.
All entities live in `src/shared/entities/`.

## Rails-Style Local DB Default

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
// src/shared/entities/user/user.ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  email: text("email").notNull().unique(),
  id: text("id").primaryKey(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  name: text("name").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});
```

## Types Example

```typescript
// src/shared/entities/user/types.ts
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { users } from "./user";

export type NewUser = InferInsertModel<typeof users>;
export type UpdateUser = Partial<NewUser>;
export type User = InferSelectModel<typeof users>;
```

## DB Client Example (libSQL)

```typescript
// src/shared/db/client.ts
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "@/shared/entities";

function resolveDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL ?? "file:src/shared/db/local/development.sqlite"
  );
}

const client = createClient({ url: resolveDatabaseUrl() });

export const db = drizzle(client, { schema });
```

## Drizzle Config Example

```typescript
// drizzle.config.ts
import type { Config } from "drizzle-kit";

function resolveDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL ?? "file:src/shared/db/local/development.sqlite"
  );
}

export default {
  dbCredentials: { url: resolveDatabaseUrl() },
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

Recommended env-specific usage:

```bash
DATABASE_URL=file:src/shared/db/local/development.sqlite npm run db:migrate
DATABASE_URL=file:src/shared/db/local/test.sqlite npm run db:migrate
```

## Seeds

Seeds live in `src/shared/db/seeds/` and should be deterministic.

```txt
src/shared/db/seeds/
├── index.ts
├── users.seed.ts
└── posts.seed.ts
```

## DB Task Checklist (Required)

For every DB-related task:

1. Identify target env (`dev`/`test`/`prod`)
2. Document migration impact + rollback strategy
3. Document seed impact + determinism expectations
4. Run quality gates (`npm run check-types`, `npm run lint`, `npm test`)
5. Verify tests point to the intended DB URL/file
6. Verify test DB reset strategy is deterministic
