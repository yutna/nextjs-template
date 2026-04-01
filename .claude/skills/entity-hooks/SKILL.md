---
name: entity-hooks
description: This skill should be used when implementing entity lifecycle hooks (Rails callbacks equivalent). Provides patterns for before_save, after_create, and other lifecycle events.
triggers:
  - callback
  - hook
  - before_save
  - after_create
  - lifecycle
  - entity hook
  - model callback
---

# Entity Hooks Skill

Entity hooks are the Next.js equivalent of Rails callbacks (`before_save`, `after_create`, `after_commit`). Since Drizzle doesn't have native callbacks, we implement hooks as composable Effect functions that wrap repository operations.

## Location

Hooks live alongside the entity they belong to:

```
shared/entities/<name>/
├── <name>.ts          # Drizzle schema
├── types.ts           # Types
├── relations.ts       # Relations (optional)
├── scopes.ts          # Query scopes (optional)
└── hooks.ts           # Entity hooks (NEW)
```

## Basic Hook Pattern

```typescript
// shared/entities/user/hooks.ts
import { Effect } from "effect";

import type { NewUser, UpdateUser, User } from "./types";

export const UserHooks = {
  /**
   * Called before creating a new user.
   * Normalizes email, sets timestamps.
   */
  beforeCreate: (data: NewUser): Effect.Effect<NewUser, never> =>
    Effect.succeed({
      ...data,
      email: data.email.toLowerCase().trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }),

  /**
   * Called after a user is created.
   * Triggers side effects like welcome email, analytics.
   */
  afterCreate: (user: User): Effect.Effect<void, never> =>
    Effect.sync(() => {
      // Side effects: logging, analytics, notifications
      console.log(`User created: ${user.id}`);
    }),

  /**
   * Called before updating a user.
   * Updates the updatedAt timestamp.
   */
  beforeUpdate: (data: UpdateUser): Effect.Effect<UpdateUser, never> =>
    Effect.succeed({
      ...data,
      updatedAt: new Date(),
    }),

  /**
   * Called after a user is updated.
   */
  afterUpdate: (user: User): Effect.Effect<void, never> =>
    Effect.sync(() => {
      console.log(`User updated: ${user.id}`);
    }),

  /**
   * Called before deleting a user.
   * Can be used for soft delete logic.
   */
  beforeDelete: (user: User): Effect.Effect<User, never> =>
    Effect.succeed(user),

  /**
   * Called after a user is deleted.
   */
  afterDelete: (user: User): Effect.Effect<void, never> =>
    Effect.sync(() => {
      console.log(`User deleted: ${user.id}`);
    }),
};
```

## Repository Integration

Integrate hooks into repository operations:

```typescript
// modules/users/repositories/user-repository/user-repository.ts
import { Effect, pipe } from "effect";
import { eq } from "drizzle-orm";

import { db } from "@/shared/db";
import { users } from "@/shared/entities/user";
import { UserHooks } from "@/shared/entities/user/hooks";

import type { DatabaseError, NewUser, UpdateUser, User } from "./types";

export const UserRepository = {
  create: (data: NewUser): Effect.Effect<User, DatabaseError> =>
    pipe(
      // 1. Run beforeCreate hook
      UserHooks.beforeCreate(data),
      // 2. Insert into database
      Effect.flatMap((prepared) =>
        Effect.tryPromise({
          try: async () => {
            const [user] = await db.insert(users).values(prepared).returning();
            return user;
          },
          catch: (error) => new DatabaseError(error),
        })
      ),
      // 3. Run afterCreate hook (tap to not change the value)
      Effect.tap(UserHooks.afterCreate)
    ),

  update: (id: string, data: UpdateUser): Effect.Effect<User, DatabaseError> =>
    pipe(
      // 1. Run beforeUpdate hook
      UserHooks.beforeUpdate(data),
      // 2. Update in database
      Effect.flatMap((prepared) =>
        Effect.tryPromise({
          try: async () => {
            const [user] = await db
              .update(users)
              .set(prepared)
              .where(eq(users.id, id))
              .returning();
            return user;
          },
          catch: (error) => new DatabaseError(error),
        })
      ),
      // 3. Run afterUpdate hook
      Effect.tap(UserHooks.afterUpdate)
    ),

  delete: (id: string): Effect.Effect<void, DatabaseError> =>
    pipe(
      // 1. Fetch the user first (for afterDelete hook)
      UserRepository.findById(id),
      Effect.flatMap((user) =>
        user
          ? pipe(
              // 2. Run beforeDelete hook
              UserHooks.beforeDelete(user),
              // 3. Delete from database
              Effect.flatMap(() =>
                Effect.tryPromise({
                  try: () => db.delete(users).where(eq(users.id, id)),
                  catch: (error) => new DatabaseError(error),
                })
              ),
              // 4. Run afterDelete hook
              Effect.tap(() => UserHooks.afterDelete(user)),
              Effect.asVoid
            )
          : Effect.void
      )
    ),
};
```

## Advanced Hook Patterns

### Hooks with Dependencies (Services)

```typescript
// shared/entities/user/hooks.ts
import { Effect } from "effect";

import { EmailService } from "@/shared/services/email";
import { AnalyticsService } from "@/shared/services/analytics";

import type { User } from "./types";

export const UserHooks = {
  afterCreate: (user: User): Effect.Effect<void, never> =>
    Effect.gen(function* () {
      // Send welcome email (fire and forget)
      yield* Effect.fork(
        EmailService.sendWelcome(user.email, user.name).pipe(
          Effect.catchAll(() => Effect.void) // Ignore email errors
        )
      );

      // Track analytics
      yield* AnalyticsService.track("user.created", { userId: user.id }).pipe(
        Effect.catchAll(() => Effect.void)
      );
    }),
};
```

### Conditional Hooks

```typescript
export const UserHooks = {
  afterUpdate: (
    before: User,
    after: User
  ): Effect.Effect<void, never> =>
    Effect.gen(function* () {
      // Only send email if email changed
      if (before.email !== after.email) {
        yield* EmailService.sendEmailChanged(after.email, before.email).pipe(
          Effect.catchAll(() => Effect.void)
        );
      }

      // Only notify if role changed to admin
      if (before.role !== "admin" && after.role === "admin") {
        yield* NotificationService.notifyNewAdmin(after.id).pipe(
          Effect.catchAll(() => Effect.void)
        );
      }
    }),
};
```

### Validation Hooks

```typescript
export const UserHooks = {
  beforeCreate: (data: NewUser): Effect.Effect<NewUser, ValidationError> =>
    Effect.gen(function* () {
      // Validate email format
      if (!isValidEmail(data.email)) {
        yield* Effect.fail(new ValidationError("Invalid email format"));
      }

      // Validate password strength
      if (data.password && !isStrongPassword(data.password)) {
        yield* Effect.fail(new ValidationError("Password too weak"));
      }

      return {
        ...data,
        email: data.email.toLowerCase().trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),
};
```

### Hooks with Transactions

```typescript
// When hooks need to be part of a transaction
export const createUserWithProfile = (
  userData: NewUser,
  profileData: NewProfile
): Effect.Effect<User, DatabaseError> =>
  Effect.tryPromise({
    try: () =>
      db.transaction(async (tx) => {
        // Prepare data with hook
        const preparedUser = await Effect.runPromise(
          UserHooks.beforeCreate(userData)
        );

        // Insert user
        const [user] = await tx.insert(users).values(preparedUser).returning();

        // Insert profile
        await tx.insert(profiles).values({
          ...profileData,
          userId: user.id,
        });

        // Run afterCreate (outside transaction for side effects)
        // Or use afterCommit pattern below
        return user;
      }),
    catch: (error) => new DatabaseError(error),
  }).pipe(
    // afterCreate runs after transaction commits
    Effect.tap(UserHooks.afterCreate)
  );
```

## Hook Types Reference

| Hook | When Called | Common Uses |
|------|-------------|-------------|
| `beforeCreate` | Before INSERT | Normalize data, set defaults, validate |
| `afterCreate` | After INSERT | Send notifications, trigger jobs, analytics |
| `beforeUpdate` | Before UPDATE | Update timestamps, validate changes |
| `afterUpdate` | After UPDATE | Notify on changes, sync external systems |
| `beforeDelete` | Before DELETE | Soft delete, cleanup related data |
| `afterDelete` | After DELETE | Cleanup external resources, notify |

## Index Export

```typescript
// shared/entities/user/index.ts
export { users } from "./user";
export { usersRelations } from "./relations";
export { UserHooks } from "./hooks";
export { UserScopes } from "./scopes";
export type { User, NewUser, UpdateUser } from "./types";
```

## Testing Hooks

```typescript
// shared/entities/user/hooks.test.ts
import { describe, it, expect } from "vitest";
import { Effect } from "effect";

import { UserHooks } from "./hooks";

describe("UserHooks", () => {
  describe("beforeCreate", () => {
    it("should normalize email to lowercase", async () => {
      const input = { email: "TEST@Example.COM", name: "Test" };
      const result = await Effect.runPromise(UserHooks.beforeCreate(input));

      expect(result.email).toBe("test@example.com");
    });

    it("should set createdAt and updatedAt", async () => {
      const input = { email: "test@example.com", name: "Test" };
      const result = await Effect.runPromise(UserHooks.beforeCreate(input));

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("beforeUpdate", () => {
    it("should update updatedAt timestamp", async () => {
      const input = { name: "Updated Name" };
      const result = await Effect.runPromise(UserHooks.beforeUpdate(input));

      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });
});
```

## Rails Callback Mapping

| Rails Callback | Next.js Hook |
|----------------|--------------|
| `before_validation` | Part of `beforeCreate`/`beforeUpdate` |
| `after_validation` | N/A (validation is explicit) |
| `before_save` | `beforeCreate` + `beforeUpdate` |
| `after_save` | `afterCreate` + `afterUpdate` |
| `before_create` | `beforeCreate` |
| `after_create` | `afterCreate` |
| `before_update` | `beforeUpdate` |
| `after_update` | `afterUpdate` |
| `before_destroy` | `beforeDelete` |
| `after_destroy` | `afterDelete` |
| `after_commit` | Effect.tap after transaction |
| `after_rollback` | Effect.catchAll in transaction |
