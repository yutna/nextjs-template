---
applyTo: "**/*.test.ts,**/*.test.tsx"
---
# Testing Conventions

## Test Framework

- **Vitest** for unit and integration tests
- **Testing Library** for component tests
- **80% coverage target**

## File Naming

Tests live next to the code they test:

```
create-user-service/
├── create-user-service.ts
└── create-user-service.test.ts

form-user-profile/
├── form-user-profile.tsx
└── form-user-profile.test.tsx
```

## Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('CreateUserService', () => {
  describe('execute', () => {
    it('creates user with valid input', async () => {
      // Arrange
      const input = { name: 'Test', email: 'test@example.com' };

      // Act
      const result = await runService(input);

      // Assert
      expect(result.name).toBe('Test');
    });

    it('fails with invalid email', async () => {
      // ...
    });
  });
});
```

## Effect Testing

```typescript
import { Effect, Layer } from 'effect';

// Create test layer
const TestUserRepository = Layer.succeed(
  UserRepository,
  {
    create: (data) => Effect.succeed({ ...data, id: 'test-id' }),
  }
);

// Run with test dependencies
const runService = (input: CreateUserInput) =>
  Effect.runPromise(
    createUserService.execute(input).pipe(
      Effect.provide(TestUserRepository),
    )
  );
```

## Component Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UserForm } from './user-form';

describe('UserForm', () => {
  it('submits form with valid data', async () => {
    const onSubmit = vi.fn();
    render(<UserForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Test User' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith({ name: 'Test User' });
  });
});
```

## Test Coverage

Cover these scenarios:
- Happy path (success)
- Validation errors
- Not found cases
- Authorization failures
- Edge cases

## Factory Usage

```typescript
import { userFactory } from '@/shared/factories/user';

const user = userFactory.build();
const users = userFactory.buildList(5);
const adminUser = userFactory.build({ role: 'admin' });
```

## Do Not

- Skip tests for services/repositories
- Use real database in unit tests
- Test implementation details
- Write tests without assertions
