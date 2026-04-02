---
applyTo: "**/services/**,**/repositories/**,**/jobs/**,**/api/**"
---
# Effect Backend Conventions

## Always Use Effect For

- Services (business logic)
- Repositories (data access)
- Jobs (background tasks)
- API handlers (external endpoints)
- Policies (authorization)

## Service Pattern

```typescript
// src/modules/users/services/create-user-service/create-user-service.ts
import { Effect, Context, Layer } from 'effect';

// Define the service interface
export interface CreateUserService {
  readonly execute: (input: CreateUserInput) => Effect.Effect<User, CreateUserError>;
}

// Create the service tag
export const CreateUserService = Context.Tag<CreateUserService>();

// Implement the service
export const CreateUserServiceLive = Layer.succeed(
  CreateUserService,
  {
    execute: (input) =>
      Effect.gen(function* () {
        const repo = yield* UserRepository;
        // Business logic here
        return yield* repo.create(input);
      }),
  }
);
```

## Repository Pattern

```typescript
// src/modules/users/repositories/user-repository/user-repository.ts
import { Effect, Context, Layer } from 'effect';
import { db } from '@/shared/db';

export interface UserRepository {
  readonly create: (data: CreateUserInput) => Effect.Effect<User, DatabaseError>;
  readonly findById: (id: string) => Effect.Effect<User | null, DatabaseError>;
}

export const UserRepository = Context.Tag<UserRepository>();

export const UserRepositoryLive = Layer.succeed(
  UserRepository,
  {
    create: (data) =>
      Effect.tryPromise({
        try: () => db.insert(users).values(data).returning(),
        catch: (e) => new DatabaseError({ cause: e }),
      }),
    findById: (id) =>
      Effect.tryPromise({
        try: () => db.query.users.findFirst({ where: eq(users.id, id) }),
        catch: (e) => new DatabaseError({ cause: e }),
      }),
  }
);
```

## Error Handling

```typescript
// Define typed errors
import { Data } from 'effect';

export class UserNotFoundError extends Data.TaggedError('UserNotFoundError')<{
  userId: string;
}> {}

export class ValidationError extends Data.TaggedError('ValidationError')<{
  field: string;
  message: string;
}> {}

// Handle errors in effects
Effect.gen(function* () {
  const user = yield* repo.findById(id);
  if (!user) {
    return yield* Effect.fail(new UserNotFoundError({ userId: id }));
  }
  return user;
});
```

## Running Effects

```typescript
// In server actions or API handlers
import { Effect } from 'effect';

const result = await Effect.runPromise(
  createUserService.execute(input).pipe(
    Effect.provide(CreateUserServiceLive),
    Effect.provide(UserRepositoryLive),
  )
);
```

## Testing

```typescript
// Use test layers
const TestUserRepository = Layer.succeed(
  UserRepository,
  {
    create: (data) => Effect.succeed({ ...data, id: 'test-id' }),
    findById: (id) => Effect.succeed(null),
  }
);
```
