---
name: effect-patterns
description: This skill should be used when writing backend code with Effect. Provides Effect-TS patterns for services, repositories, error handling, and testing.
triggers:
  - service
  - repository
  - Effect
  - backend logic
  - business logic
  - error handling
  - type-safe errors
---

# Effect Patterns Skill

Effect is REQUIRED for all backend layers: services, repositories, jobs, api handlers, policies.

## Core Imports

```typescript
import { Effect, pipe, Either, Option, Array as Arr } from "effect";
```

## Service Pattern

### Basic Service Structure

```typescript
// create-user-service/types.ts
export interface CreateUserInput {
  email: string;
  name: string;
}

export interface CreateUserOutput {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// Tagged error classes
export class DuplicateEmailError {
  readonly _tag = "DuplicateEmailError";
  constructor(readonly email: string) {}
}

export class ValidationError {
  readonly _tag = "ValidationError";
  constructor(readonly message: string) {}
}

export type CreateUserError = DuplicateEmailError | ValidationError;
```

```typescript
// create-user-service/create-user-service.ts
import { Effect, pipe } from "effect";
import { UserRepository } from "@/modules/users/repositories/user-repository";
import type { CreateUserInput, CreateUserOutput, CreateUserError } from "./types";

export const createUserService = (
  input: CreateUserInput
): Effect.Effect<CreateUserOutput, CreateUserError> =>
  pipe(
    // Check for duplicate email
    UserRepository.findByEmail(input.email),
    Effect.flatMap((existing) =>
      existing
        ? Effect.fail(new DuplicateEmailError(input.email))
        : Effect.succeed(undefined)
    ),
    // Validate input
    Effect.flatMap(() => validateInput(input)),
    // Create user
    Effect.flatMap(() => UserRepository.create(input)),
    // Return result
    Effect.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    }))
  );

const validateInput = (
  input: CreateUserInput
): Effect.Effect<void, ValidationError> =>
  Effect.gen(function* () {
    if (!input.email.includes("@")) {
      yield* Effect.fail(new ValidationError("Invalid email format"));
    }
    if (input.name.length < 2) {
      yield* Effect.fail(new ValidationError("Name too short"));
    }
  });
```

### Using Effect.gen (Alternative Style)

```typescript
export const createUserService = (
  input: CreateUserInput
): Effect.Effect<CreateUserOutput, CreateUserError> =>
  Effect.gen(function* () {
    // Check for duplicate email
    const existing = yield* UserRepository.findByEmail(input.email);
    if (existing) {
      yield* Effect.fail(new DuplicateEmailError(input.email));
    }

    // Validate
    yield* validateInput(input);

    // Create user
    const user = yield* UserRepository.create(input);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  });
```

## Repository Pattern

```typescript
// user-repository/types.ts
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { users } from "@/shared/entities/user";

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export class UserNotFoundError {
  readonly _tag = "UserNotFoundError";
  constructor(readonly id: string) {}
}

export class DatabaseError {
  readonly _tag = "DatabaseError";
  constructor(readonly cause: unknown) {}
}
```

```typescript
// user-repository/user-repository.ts
import { Effect } from "effect";
import { eq } from "drizzle-orm";
import { db } from "@/shared/db";
import { users } from "@/shared/entities/user";
import type { User, NewUser, UserNotFoundError, DatabaseError } from "./types";

export const UserRepository = {
  findById: (id: string): Effect.Effect<User | null, DatabaseError> =>
    Effect.tryPromise({
      try: () => db.query.users.findFirst({ where: eq(users.id, id) }),
      catch: (error) => new DatabaseError(error),
    }),

  findByIdOrFail: (id: string): Effect.Effect<User, UserNotFoundError | DatabaseError> =>
    Effect.gen(function* () {
      const user = yield* UserRepository.findById(id);
      if (!user) {
        yield* Effect.fail(new UserNotFoundError(id));
      }
      return user;
    }),

  findByEmail: (email: string): Effect.Effect<User | null, DatabaseError> =>
    Effect.tryPromise({
      try: () => db.query.users.findFirst({ where: eq(users.email, email) }),
      catch: (error) => new DatabaseError(error),
    }),

  create: (data: NewUser): Effect.Effect<User, DatabaseError> =>
    Effect.tryPromise({
      try: async () => {
        const [user] = await db.insert(users).values(data).returning();
        return user;
      },
      catch: (error) => new DatabaseError(error),
    }),

  update: (id: string, data: Partial<NewUser>): Effect.Effect<User, DatabaseError> =>
    Effect.tryPromise({
      try: async () => {
        const [user] = await db
          .update(users)
          .set(data)
          .where(eq(users.id, id))
          .returning();
        return user;
      },
      catch: (error) => new DatabaseError(error),
    }),

  delete: (id: string): Effect.Effect<void, DatabaseError> =>
    Effect.tryPromise({
      try: () => db.delete(users).where(eq(users.id, id)),
      catch: (error) => new DatabaseError(error),
    }).pipe(Effect.asVoid),

  findAll: (): Effect.Effect<User[], DatabaseError> =>
    Effect.tryPromise({
      try: () => db.query.users.findMany(),
      catch: (error) => new DatabaseError(error),
    }),
};
```

## Error Handling Patterns

### Tagged Errors

```typescript
// Always use tagged error classes
export class NotFoundError {
  readonly _tag = "NotFoundError";
  constructor(readonly resource: string, readonly id: string) {}
}

export class UnauthorizedError {
  readonly _tag = "UnauthorizedError";
  constructor(readonly reason: string) {}
}

export class ValidationError {
  readonly _tag = "ValidationError";
  constructor(readonly field: string, readonly message: string) {}
}
```

### Error Mapping

```typescript
// Map errors to different types
const result = pipe(
  someEffect,
  Effect.mapError((error) => {
    switch (error._tag) {
      case "DatabaseError":
        return new InternalError("Database unavailable");
      case "NotFoundError":
        return new NotFoundError("user", error.id);
      default:
        return new UnknownError(error);
    }
  })
);
```

### Catching Specific Errors

```typescript
const result = pipe(
  someEffect,
  Effect.catchTag("NotFoundError", (error) =>
    Effect.succeed(null) // Return null instead of failing
  ),
  Effect.catchTag("ValidationError", (error) =>
    Effect.fail(new BadRequestError(error.message))
  )
);
```

## Composing Effects

### Sequential Composition

```typescript
const workflow = pipe(
  validateInput(input),
  Effect.flatMap(() => checkPermissions(user)),
  Effect.flatMap(() => createResource(input)),
  Effect.flatMap((resource) => sendNotification(resource)),
  Effect.map((resource) => ({ success: true, resource }))
);
```

### Parallel Composition

```typescript
const fetchAll = Effect.all([
  UserRepository.findById(userId),
  OrderRepository.findByUserId(userId),
  NotificationRepository.findByUserId(userId),
]);

// With concurrency limit
const results = Effect.all(items.map(processItem), { concurrency: 5 });
```

## Running Effects

### In Server Actions

```typescript
// In next-safe-action
import { Effect } from "effect";
import { actionClient } from "@/shared/lib/safe-action";

export const createUserAction = actionClient
  .schema(createUserSchema)
  .action(async ({ parsedInput }) => {
    const result = await Effect.runPromise(
      createUserService(parsedInput).pipe(
        Effect.catchAll((error) => Effect.succeed({ error: error._tag }))
      )
    );
    return result;
  });
```

### In API Handlers

```typescript
export const GET = async (request: Request) => {
  const result = await Effect.runPromise(
    getUsersService().pipe(
      Effect.map((users) => Response.json(users)),
      Effect.catchTag("DatabaseError", () =>
        Effect.succeed(Response.json({ error: "Internal error" }, { status: 500 }))
      )
    )
  );
  return result;
};
```

## Testing Effect Code

```typescript
import { describe, it, expect, vi } from "vitest";
import { Effect } from "effect";
import { createUserService } from "./create-user-service";

describe("createUserService", () => {
  it("should create a user successfully", async () => {
    // Mock repository
    vi.mock("@/modules/users/repositories/user-repository", () => ({
      UserRepository: {
        findByEmail: () => Effect.succeed(null),
        create: (data) => Effect.succeed({ id: "1", ...data, createdAt: new Date() }),
      },
    }));

    const result = await Effect.runPromise(
      createUserService({ email: "test@example.com", name: "Test User" })
    );

    expect(result.email).toBe("test@example.com");
  });

  it("should fail with DuplicateEmailError", async () => {
    vi.mock("@/modules/users/repositories/user-repository", () => ({
      UserRepository: {
        findByEmail: () => Effect.succeed({ id: "existing" }),
      },
    }));

    const result = await Effect.runPromiseExit(
      createUserService({ email: "existing@example.com", name: "Test" })
    );

    expect(result._tag).toBe("Failure");
  });
});
```

## Common Patterns

### Optional to Effect

```typescript
import { Option, Effect } from "effect";

const findUser = (id: string): Effect.Effect<Option.Option<User>, DatabaseError> =>
  Effect.tryPromise({
    try: () => db.query.users.findFirst({ where: eq(users.id, id) }),
    catch: (error) => new DatabaseError(error),
  }).pipe(Effect.map(Option.fromNullable));
```

### Effect with Timeout

```typescript
import { Effect, Duration } from "effect";

const withTimeout = pipe(
  slowOperation,
  Effect.timeout(Duration.seconds(5)),
  Effect.flatMap(Option.match({
    onNone: () => Effect.fail(new TimeoutError()),
    onSome: Effect.succeed,
  }))
);
```

### Retry Logic

```typescript
import { Effect, Schedule } from "effect";

const withRetry = pipe(
  unreliableOperation,
  Effect.retry(
    Schedule.exponential(Duration.millis(100)).pipe(
      Schedule.compose(Schedule.recurs(3))
    )
  )
);
```
