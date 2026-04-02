---
name: query-scopes
description: This skill should be used when implementing composable query filters (Rails scopes equivalent). Provides patterns for reusable, chainable query conditions.
triggers:
  - scope
  - named query
  - filter
  - where clause
  - query builder
  - composable query
---

# Query Scopes Skill

Query scopes are the Next.js equivalent of Rails scopes (`scope :active, -> { where(active: true) }`). They provide composable, reusable query fragments using Drizzle's query builder.

## Location

Scopes live alongside the entity they belong to:

```
shared/entities/<name>/
├── <name>.ts          # Drizzle schema
├── types.ts           # Types
├── relations.ts       # Relations (optional)
├── scopes.ts          # Query scopes (NEW)
└── hooks.ts           # Entity hooks (optional)
```

## Basic Scope Pattern

```typescript
// shared/entities/user/scopes.ts
import { and, eq, gte, ilike, isNull, lte, or, SQL } from "drizzle-orm";

import { users } from "./user";

/**
 * Composable query scopes for the User entity.
 * Each scope returns a SQL condition that can be combined with others.
 */
export const UserScopes = {
  /** Users with isActive = true */
  active: () => eq(users.isActive, true),

  /** Users without a deletedAt timestamp (not soft-deleted) */
  notDeleted: () => isNull(users.deletedAt),

  /** Users with a specific role */
  withRole: (role: string) => eq(users.role, role),

  /** Users created after a specific date */
  createdAfter: (date: Date) => gte(users.createdAt, date),

  /** Users created before a specific date */
  createdBefore: (date: Date) => lte(users.createdAt, date),

  /** Users created within a date range */
  createdBetween: (start: Date, end: Date) =>
    and(gte(users.createdAt, start), lte(users.createdAt, end)),

  /** Case-insensitive name search */
  searchByName: (query: string) => ilike(users.name, `%${query}%`),

  /** Case-insensitive email search */
  searchByEmail: (query: string) => ilike(users.email, `%${query}%`),

  /** Search by name or email */
  search: (query: string) =>
    or(UserScopes.searchByName(query), UserScopes.searchByEmail(query)),

  /** Users with email verified */
  emailVerified: () => eq(users.emailVerified, true),

  /** Users with a specific subscription tier */
  withSubscription: (tier: "free" | "pro" | "enterprise") =>
    eq(users.subscriptionTier, tier),

  // ─────────────────────────────────────────────────────────────
  // Composite scopes (combining multiple conditions)
  // ─────────────────────────────────────────────────────────────

  /** Active users who are not soft-deleted */
  activeAndNotDeleted: () =>
    and(UserScopes.active(), UserScopes.notDeleted()),

  /** Active admin users */
  activeAdmins: () =>
    and(
      UserScopes.active(),
      UserScopes.notDeleted(),
      UserScopes.withRole("admin")
    ),

  /** Premium users (pro or enterprise) */
  premium: () =>
    and(
      UserScopes.activeAndNotDeleted(),
      or(
        UserScopes.withSubscription("pro"),
        UserScopes.withSubscription("enterprise")
      )
    ),

  /** Recently registered users (last 7 days) */
  recentlyRegistered: () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return and(
      UserScopes.activeAndNotDeleted(),
      UserScopes.createdAfter(sevenDaysAgo)
    );
  },
};
```

## Usage in Repository

```typescript
// modules/users/repositories/user-repository/user-repository.ts
import { Effect } from "effect";
import { desc } from "drizzle-orm";

import { db } from "@/shared/db";
import { users } from "@/shared/entities/user";
import { UserScopes } from "@/shared/entities/user/scopes";

import type { DatabaseError, User } from "./types";

export const UserRepository = {
  /** Find all active users */
  findActive: (): Effect.Effect<User[], DatabaseError> =>
    Effect.tryPromise({
      try: () =>
        db.query.users.findMany({
          where: UserScopes.activeAndNotDeleted(),
          orderBy: [desc(users.createdAt)],
        }),
      catch: (error) => new DatabaseError(error),
    }),

  /** Find all admins */
  findAdmins: (): Effect.Effect<User[], DatabaseError> =>
    Effect.tryPromise({
      try: () =>
        db.query.users.findMany({
          where: UserScopes.activeAdmins(),
        }),
      catch: (error) => new DatabaseError(error),
    }),

  /** Search users with filters */
  search: (filters: {
    query?: string;
    role?: string;
    createdAfter?: Date;
  }): Effect.Effect<User[], DatabaseError> =>
    Effect.tryPromise({
      try: () => {
        // Build conditions array dynamically
        const conditions: SQL[] = [UserScopes.activeAndNotDeleted()];

        if (filters.query) {
          conditions.push(UserScopes.search(filters.query));
        }
        if (filters.role) {
          conditions.push(UserScopes.withRole(filters.role));
        }
        if (filters.createdAfter) {
          conditions.push(UserScopes.createdAfter(filters.createdAfter));
        }

        return db.query.users.findMany({
          where: and(...conditions),
          orderBy: [desc(users.createdAt)],
        });
      },
      catch: (error) => new DatabaseError(error),
    }),

  /** Find premium users for a feature */
  findPremium: (): Effect.Effect<User[], DatabaseError> =>
    Effect.tryPromise({
      try: () =>
        db.query.users.findMany({
          where: UserScopes.premium(),
        }),
      catch: (error) => new DatabaseError(error),
    }),

  /** Count recently registered users */
  countRecentlyRegistered: (): Effect.Effect<number, DatabaseError> =>
    Effect.tryPromise({
      try: async () => {
        const result = await db
          .select({ count: sql<number>`count(*)` })
          .from(users)
          .where(UserScopes.recentlyRegistered());
        return result[0].count;
      },
      catch: (error) => new DatabaseError(error),
    }),
};
```

## Dynamic Scope Composition

### Building Queries Dynamically

```typescript
// modules/users/repositories/user-repository/helpers.ts
import { and, SQL } from "drizzle-orm";

import { UserScopes } from "@/shared/entities/user/scopes";

export interface UserFilters {
  isActive?: boolean;
  role?: string;
  search?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  subscriptionTier?: "free" | "pro" | "enterprise";
  emailVerified?: boolean;
}

/**
 * Build a WHERE clause from filter object.
 * Returns undefined if no filters, allowing all records.
 */
export function buildUserWhereClause(filters: UserFilters): SQL | undefined {
  const conditions: SQL[] = [];

  // Always exclude soft-deleted
  conditions.push(UserScopes.notDeleted());

  if (filters.isActive !== undefined) {
    conditions.push(
      filters.isActive ? UserScopes.active() : eq(users.isActive, false)
    );
  }

  if (filters.role) {
    conditions.push(UserScopes.withRole(filters.role));
  }

  if (filters.search) {
    conditions.push(UserScopes.search(filters.search));
  }

  if (filters.createdAfter) {
    conditions.push(UserScopes.createdAfter(filters.createdAfter));
  }

  if (filters.createdBefore) {
    conditions.push(UserScopes.createdBefore(filters.createdBefore));
  }

  if (filters.subscriptionTier) {
    conditions.push(UserScopes.withSubscription(filters.subscriptionTier));
  }

  if (filters.emailVerified !== undefined) {
    conditions.push(
      filters.emailVerified
        ? UserScopes.emailVerified()
        : eq(users.emailVerified, false)
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}
```

### Using in Repository

```typescript
export const UserRepository = {
  findWithFilters: (
    filters: UserFilters,
    pagination: { page: number; pageSize: number }
  ): Effect.Effect<{ data: User[]; total: number }, DatabaseError> =>
    Effect.tryPromise({
      try: async () => {
        const whereClause = buildUserWhereClause(filters);

        const [data, countResult] = await Promise.all([
          db.query.users.findMany({
            where: whereClause,
            limit: pagination.pageSize,
            offset: (pagination.page - 1) * pagination.pageSize,
            orderBy: [desc(users.createdAt)],
          }),
          db
            .select({ count: sql<number>`count(*)` })
            .from(users)
            .where(whereClause),
        ]);

        return {
          data,
          total: countResult[0].count,
        };
      },
      catch: (error) => new DatabaseError(error),
    }),
};
```

## Scopes with Relations

```typescript
// shared/entities/post/scopes.ts
import { and, eq, gte, isNull, SQL } from "drizzle-orm";

import { posts } from "./post";

export const PostScopes = {
  published: () => eq(posts.status, "published"),

  draft: () => eq(posts.status, "draft"),

  notDeleted: () => isNull(posts.deletedAt),

  byAuthor: (authorId: string) => eq(posts.authorId, authorId),

  publishedAfter: (date: Date) =>
    and(PostScopes.published(), gte(posts.publishedAt, date)),

  /** Published posts by a specific author */
  publishedByAuthor: (authorId: string) =>
    and(
      PostScopes.published(),
      PostScopes.notDeleted(),
      PostScopes.byAuthor(authorId)
    ),
};

// Usage with relations in repository
export const PostRepository = {
  findPublishedWithAuthor: (): Effect.Effect<PostWithAuthor[], DatabaseError> =>
    Effect.tryPromise({
      try: () =>
        db.query.posts.findMany({
          where: and(PostScopes.published(), PostScopes.notDeleted()),
          with: {
            author: true,
          },
          orderBy: [desc(posts.publishedAt)],
        }),
      catch: (error) => new DatabaseError(error),
    }),
};
```

## Scope Utilities

### Optional Scope Application

```typescript
// shared/entities/utils/scope-utils.ts
import { and, SQL } from "drizzle-orm";

/**
 * Apply a scope only if condition is true.
 */
export function when<T>(
  condition: T | undefined | null,
  scopeFn: (value: T) => SQL
): SQL | undefined {
  return condition != null ? scopeFn(condition) : undefined;
}

/**
 * Combine multiple optional scopes, filtering out undefined.
 */
export function combineScopes(...scopes: (SQL | undefined)[]): SQL | undefined {
  const defined = scopes.filter((s): s is SQL => s !== undefined);
  return defined.length > 0 ? and(...defined) : undefined;
}

// Usage
const whereClause = combineScopes(
  UserScopes.activeAndNotDeleted(),
  when(filters.role, UserScopes.withRole),
  when(filters.search, UserScopes.search),
  when(filters.createdAfter, UserScopes.createdAfter)
);
```

## Index Export

```typescript
// shared/entities/user/index.ts
export { users } from "./user";
export { usersRelations } from "./relations";
export { UserScopes } from "./scopes";
export { UserHooks } from "./hooks";
export type { User, NewUser, UpdateUser } from "./types";
```

## Testing Scopes

```typescript
// shared/entities/user/scopes.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";

import { db } from "@/shared/db";
import { users } from "./user";
import { UserScopes } from "./scopes";

describe("UserScopes", () => {
  beforeEach(async () => {
    // Seed test data
    await db.delete(users);
    await db.insert(users).values([
      { id: "1", email: "active@test.com", name: "Active", isActive: true },
      { id: "2", email: "inactive@test.com", name: "Inactive", isActive: false },
      { id: "3", email: "admin@test.com", name: "Admin", isActive: true, role: "admin" },
      { id: "4", email: "deleted@test.com", name: "Deleted", deletedAt: new Date() },
    ]);
  });

  describe("active", () => {
    it("should return only active users", async () => {
      const result = await db.query.users.findMany({
        where: UserScopes.active(),
      });

      expect(result).toHaveLength(3);
      expect(result.every((u) => u.isActive)).toBe(true);
    });
  });

  describe("activeAndNotDeleted", () => {
    it("should exclude soft-deleted users", async () => {
      const result = await db.query.users.findMany({
        where: UserScopes.activeAndNotDeleted(),
      });

      expect(result).toHaveLength(2);
      expect(result.every((u) => u.deletedAt === null)).toBe(true);
    });
  });

  describe("activeAdmins", () => {
    it("should return only active admin users", async () => {
      const result = await db.query.users.findMany({
        where: UserScopes.activeAdmins(),
      });

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe("admin");
    });
  });

  describe("search", () => {
    it("should find users by name or email", async () => {
      const result = await db.query.users.findMany({
        where: UserScopes.search("admin"),
      });

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe("admin@test.com");
    });
  });
});
```

## Rails Scope Mapping

| Rails Scope | Next.js Equivalent |
|-------------|-------------------|
| `scope :active, -> { where(active: true) }` | `active: () => eq(users.isActive, true)` |
| `scope :recent, -> { order(created_at: :desc) }` | Order in query, not scope |
| `scope :by_role, ->(role) { where(role: role) }` | `withRole: (role) => eq(users.role, role)` |
| `scope :search, ->(q) { where("name ILIKE ?", "%#{q}%") }` | `search: (q) => ilike(users.name, \`%${q}%\`)` |
| Chained: `User.active.admins` | `and(UserScopes.active(), UserScopes.withRole("admin"))` |
| Default scope | Apply in repository methods |
