---
name: drizzle-patterns
description: This skill should be used when working with database, Drizzle ORM, entities, schemas, or queries. Provides Drizzle schema patterns, query patterns, and migrations.
triggers:
  - database
  - drizzle
  - entity
  - schema
  - migration
  - query
  - table
  - model
---

# Drizzle Patterns Skill

Drizzle is the database ORM for this project. All entities live in `shared/entities/`.

## Entity Structure

Entities MUST be in `shared/entities/<name>/` (never in modules).

```
shared/entities/
├── user/
│   ├── index.ts          # Barrel export
│   ├── user.ts           # Drizzle schema
│   ├── types.ts          # Inferred types
│   └── relations.ts      # (optional) Relations
├── post/
│   ├── index.ts
│   ├── post.ts
│   ├── types.ts
│   └── relations.ts
└── index.ts              # Re-export all entities
```

## Schema Definition

### Basic Schema

```typescript
// shared/entities/user/user.ts
import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
```

### With Enums

```typescript
// shared/entities/order/order.ts
import { pgTable, text, timestamp, uuid, pgEnum, integer } from "drizzle-orm/pg-core";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  status: orderStatusEnum("status").notNull().default("pending"),
  totalAmount: integer("total_amount").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
```

### With JSON Column

```typescript
import { pgTable, uuid, jsonb, timestamp } from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  preferences: jsonb("preferences").$type<UserPreferences>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

interface UserPreferences {
  theme: "light" | "dark";
  notifications: boolean;
  language: string;
}
```

## Types File

```typescript
// shared/entities/user/types.ts
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { users } from "./user";

// Select type (for reading)
export type User = InferSelectModel<typeof users>;

// Insert type (for creating)
export type NewUser = InferInsertModel<typeof users>;

// Update type (partial, for updating)
export type UpdateUser = Partial<NewUser>;

// Custom types for specific use cases
export type UserPublic = Pick<User, "id" | "name" | "avatarUrl">;
export type UserWithEmail = Pick<User, "id" | "name" | "email">;
```

## Relations

```typescript
// shared/entities/user/relations.ts
import { relations } from "drizzle-orm";
import { users } from "./user";
import { posts } from "../post/post";
import { orders } from "../order/order";

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  orders: many(orders),
}));
```

```typescript
// shared/entities/post/relations.ts
import { relations } from "drizzle-orm";
import { posts } from "./post";
import { users } from "../user/user";
import { comments } from "../comment/comment";

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
}));
```

## Index File

```typescript
// shared/entities/user/index.ts
export { users } from "./user";
export { usersRelations } from "./relations";
export type { User, NewUser, UpdateUser, UserPublic } from "./types";
```

```typescript
// shared/entities/index.ts
export * from "./user";
export * from "./post";
export * from "./order";
```

## Database Client

```typescript
// shared/db/client.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/shared/entities";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
```

```typescript
// shared/db/schema.ts
// Re-export all entities for migrations
export * from "@/shared/entities";
```

```typescript
// shared/db/index.ts
export { db } from "./client";
export * from "./schema";
```

## Query Patterns (with Effect)

### Find One

```typescript
import { Effect } from "effect";
import { eq } from "drizzle-orm";
import { db } from "@/shared/db";
import { users } from "@/shared/entities/user";

export const findById = (id: string): Effect.Effect<User | null, DatabaseError> =>
  Effect.tryPromise({
    try: () => db.query.users.findFirst({
      where: eq(users.id, id),
    }),
    catch: (error) => new DatabaseError(error),
  });
```

### Find with Relations

```typescript
export const findByIdWithPosts = (id: string): Effect.Effect<UserWithPosts | null, DatabaseError> =>
  Effect.tryPromise({
    try: () => db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        posts: {
          orderBy: (posts, { desc }) => [desc(posts.createdAt)],
          limit: 10,
        },
      },
    }),
    catch: (error) => new DatabaseError(error),
  });
```

### Find Many with Filters

```typescript
import { and, eq, gte, like, desc } from "drizzle-orm";

export const findActiveUsers = (
  search?: string,
  minDate?: Date
): Effect.Effect<User[], DatabaseError> =>
  Effect.tryPromise({
    try: () => db.query.users.findMany({
      where: and(
        eq(users.isActive, true),
        search ? like(users.name, `%${search}%`) : undefined,
        minDate ? gte(users.createdAt, minDate) : undefined
      ),
      orderBy: [desc(users.createdAt)],
    }),
    catch: (error) => new DatabaseError(error),
  });
```

### Insert

```typescript
export const create = (data: NewUser): Effect.Effect<User, DatabaseError> =>
  Effect.tryPromise({
    try: async () => {
      const [user] = await db.insert(users).values(data).returning();
      return user;
    },
    catch: (error) => new DatabaseError(error),
  });
```

### Insert Many

```typescript
export const createMany = (data: NewUser[]): Effect.Effect<User[], DatabaseError> =>
  Effect.tryPromise({
    try: () => db.insert(users).values(data).returning(),
    catch: (error) => new DatabaseError(error),
  });
```

### Update

```typescript
export const update = (
  id: string,
  data: UpdateUser
): Effect.Effect<User, DatabaseError> =>
  Effect.tryPromise({
    try: async () => {
      const [user] = await db
        .update(users)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return user;
    },
    catch: (error) => new DatabaseError(error),
  });
```

### Delete

```typescript
export const remove = (id: string): Effect.Effect<void, DatabaseError> =>
  Effect.tryPromise({
    try: () => db.delete(users).where(eq(users.id, id)),
    catch: (error) => new DatabaseError(error),
  }).pipe(Effect.asVoid);
```

### Transactions

```typescript
export const transferCredits = (
  fromUserId: string,
  toUserId: string,
  amount: number
): Effect.Effect<void, DatabaseError | InsufficientCreditsError> =>
  Effect.tryPromise({
    try: () => db.transaction(async (tx) => {
      // Deduct from sender
      const [sender] = await tx
        .update(users)
        .set({ credits: sql`credits - ${amount}` })
        .where(and(
          eq(users.id, fromUserId),
          gte(users.credits, amount)
        ))
        .returning();

      if (!sender) {
        throw new InsufficientCreditsError();
      }

      // Add to receiver
      await tx
        .update(users)
        .set({ credits: sql`credits + ${amount}` })
        .where(eq(users.id, toUserId));
    }),
    catch: (error) => {
      if (error instanceof InsufficientCreditsError) {
        return error;
      }
      return new DatabaseError(error);
    },
  });
```

## Migrations

### Generate Migration

```bash
npm run db:generate
```

### Run Migrations

```bash
npm run db:migrate
```

### Migration File Example

```sql
-- 0000_initial.sql
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "avatar_url" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
```

## Drizzle Config

```typescript
// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/shared/db/schema.ts",
  out: "./src/shared/db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

## Common Patterns

### Soft Delete

```typescript
export const users = pgTable("users", {
  // ... other fields
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// Query only active users
export const findActiveUsers = () =>
  db.query.users.findMany({
    where: isNull(users.deletedAt),
  });

// Soft delete
export const softDelete = (id: string) =>
  db.update(users)
    .set({ deletedAt: new Date() })
    .where(eq(users.id, id));
```

### Pagination

```typescript
export const findPaginated = (
  page: number,
  pageSize: number
): Effect.Effect<{ data: User[]; total: number }, DatabaseError> =>
  Effect.tryPromise({
    try: async () => {
      const [data, countResult] = await Promise.all([
        db.query.users.findMany({
          limit: pageSize,
          offset: (page - 1) * pageSize,
          orderBy: [desc(users.createdAt)],
        }),
        db.select({ count: sql<number>`count(*)` }).from(users),
      ]);

      return {
        data,
        total: countResult[0].count,
      };
    },
    catch: (error) => new DatabaseError(error),
  });
```

### Upsert

```typescript
export const upsert = (data: NewUser): Effect.Effect<User, DatabaseError> =>
  Effect.tryPromise({
    try: async () => {
      const [user] = await db
        .insert(users)
        .values(data)
        .onConflictDoUpdate({
          target: users.email,
          set: { name: data.name, updatedAt: new Date() },
        })
        .returning();
      return user;
    },
    catch: (error) => new DatabaseError(error),
  });
```

## Seeds

Seeds live in `shared/db/seeds/` and provide initial/sample data.

### Seed Structure

```
shared/db/seeds/
├── index.ts           # Main seed runner
├── users.seed.ts      # User seed data
├── posts.seed.ts      # Post seed data
└── _order.ts          # Seed execution order
```

### Seed File Example

```typescript
// shared/db/seeds/users.seed.ts
import { db } from "@/shared/db";
import { users } from "@/shared/entities/user";
import { UserFactory } from "@/shared/factories/user-factory";

export async function seedUsers() {
  console.log("🌱 Seeding users...");

  // Clear existing data (dev only)
  await db.delete(users);

  // Create admin user
  await db.insert(users).values({
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
  });

  // Create sample users using factory
  const sampleUsers = UserFactory.buildList(10);
  await db.insert(users).values(sampleUsers);

  console.log("✅ Users seeded");
}
```

### Seed Runner

```typescript
// shared/db/seeds/index.ts
import { seedUsers } from "./users.seed";
import { seedPosts } from "./posts.seed";

const seeds = [
  seedUsers,
  seedPosts,
];

async function main() {
  console.log("🌱 Starting database seed...");

  for (const seed of seeds) {
    await seed();
  }

  console.log("✅ Database seeded successfully");
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
```

### Package.json Script

```json
{
  "scripts": {
    "db:seed": "npx tsx shared/db/seeds/index.ts"
  }
}
```
