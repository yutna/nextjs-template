---
name: nextjs-testing
description: This skill should be used when writing tests, using Vitest, or implementing Testing Library patterns. Guides Vitest and Testing Library setup.
---

# Next.js Testing

Use this skill when writing tests with Vitest and Testing Library.

## Reference

- .claude/workflow-profile.json (stack.testing)
- vitest.config.ts (Vitest configuration)

## Vitest Setup

### Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
      thresholds: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
  },
});
```

### Test Setup

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));
```

## Component Testing

### Testing Server Components

```tsx
// src/modules/users/components/UserCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  };

  it('renders user information', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('displays avatar with user initials', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});
```

### Testing Client Components

```tsx
// src/modules/users/containers/UserFormContainer.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { UserFormContainer } from './UserFormContainer';

// Mock the server action
vi.mock('../actions/createUser', () => ({
  createUser: vi.fn(),
}));

import { createUser } from '../actions/createUser';

describe('UserFormContainer', () => {
  it('submits form with user data', async () => {
    const user = userEvent.setup();
    const mockCreateUser = vi.mocked(createUser);
    mockCreateUser.mockResolvedValue({ data: { success: true } });

    render(<UserFormContainer />);

    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });
  });

  it('displays validation errors', async () => {
    const user = userEvent.setup();
    const mockCreateUser = vi.mocked(createUser);
    mockCreateUser.mockResolvedValue({
      validationErrors: {
        email: { _errors: ['Invalid email'] },
      },
    });

    render(<UserFormContainer />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });
});
```

### Testing Hooks

```tsx
// src/modules/users/hooks/useUserFilters.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useUserFilters } from './useUserFilters';

describe('useUserFilters', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useUserFilters());

    expect(result.current.filters.search).toBe('');
    expect(result.current.filters.role).toBe(null);
  });

  it('updates search filter', async () => {
    const { result } = renderHook(() => useUserFilters());

    await act(async () => {
      await result.current.setSearch('john');
    });

    expect(result.current.filters.search).toBe('john');
  });
});
```

## Testing Server Actions

```typescript
// src/modules/users/actions/createUser.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUser } from './createUser';

// Mock database
vi.mock('@/shared/lib/db', () => ({
  db: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { db } from '@/shared/lib/db';

describe('createUser action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates user with valid data', async () => {
    const mockUser = { id: '1', name: 'John', email: 'john@example.com' };
    vi.mocked(db.user.create).mockResolvedValue(mockUser);

    const result = await createUser({
      name: 'John',
      email: 'john@example.com',
    });

    expect(result.data?.success).toBe(true);
    expect(result.data?.user).toEqual(mockUser);
  });

  it('returns validation error for invalid email', async () => {
    const result = await createUser({
      name: 'John',
      email: 'invalid-email',
    });

    expect(result.validationErrors?.email).toBeDefined();
  });

  it('handles duplicate email error', async () => {
    vi.mocked(db.user.create).mockRejectedValue({ code: 'P2002' });

    const result = await createUser({
      name: 'John',
      email: 'existing@example.com',
    });

    expect(result.serverError).toContain('already exists');
  });
});
```

## Testing Utilities

### Custom Render

```tsx
// src/test/utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ChakraProvider } from '@/shared/providers/ChakraProvider';
import { NextIntlClientProvider } from 'next-intl';

const messages = {
  common: { submit: 'Submit' },
  // Add more messages as needed
};

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <ChakraProvider>
        {children}
      </ChakraProvider>
    </NextIntlClientProvider>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { renderWithProviders as render };
```

## Factories

Factories live in `shared/factories/` and generate test/seed data.

### Factory Structure

```
shared/factories/
├── index.ts                # Barrel export
├── user-factory/
│   ├── index.ts
│   ├── user-factory.ts
│   └── types.ts
└── post-factory/
    ├── index.ts
    ├── post-factory.ts
    └── types.ts
```

### Factory Pattern

```typescript
// shared/factories/user-factory/user-factory.ts
import { faker } from "@faker-js/faker";

import type { NewUser, User } from "@/shared/entities/user";

export const UserFactory = {
  /**
   * Build a user object (not persisted)
   */
  build(overrides: Partial<NewUser> = {}): NewUser {
    return {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      avatarUrl: faker.image.avatar(),
      isActive: true,
      ...overrides,
    };
  },

  /**
   * Build multiple user objects
   */
  buildList(count: number, overrides: Partial<NewUser> = {}): NewUser[] {
    return Array.from({ length: count }, () => this.build(overrides));
  },

  /**
   * Build a complete user with ID (for mocking)
   */
  buildComplete(overrides: Partial<User> = {}): User {
    return {
      id: faker.string.uuid(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...this.build(),
      ...overrides,
    };
  },

  /**
   * Build multiple complete users
   */
  buildCompleteList(count: number, overrides: Partial<User> = []): User[] {
    return Array.from({ length: count }, () => this.buildComplete(overrides));
  },
};
```

### Factory Index

```typescript
// shared/factories/user-factory/index.ts
export { UserFactory } from "./user-factory";
```

```typescript
// shared/factories/index.ts
export { UserFactory } from "./user-factory";
export { PostFactory } from "./post-factory";
```

### Using Factories in Tests

```typescript
// user-card.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UserFactory } from "@/shared/factories";

import { UserCard } from "./user-card";

describe("UserCard", () => {
  it("renders user information", () => {
    const user = UserFactory.buildComplete({ name: "John Doe" });

    render(<UserCard user={user} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders multiple users", () => {
    const users = UserFactory.buildCompleteList(3);

    render(<UserList users={users} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});
```

### Using Factories in Seeds

```typescript
// shared/db/seeds/users.seed.ts
import { db } from "@/shared/db";
import { users } from "@/shared/entities/user";
import { UserFactory } from "@/shared/factories";

export async function seedUsers() {
  // Create specific users
  await db.insert(users).values({
    email: "admin@example.com",
    name: "Admin User",
  });

  // Create random users using factory
  const randomUsers = UserFactory.buildList(50);
  await db.insert(users).values(randomUsers);
}
```

### Factory with Associations

```typescript
// shared/factories/post-factory/post-factory.ts
import { faker } from "@faker-js/faker";

import { UserFactory } from "@/shared/factories/user-factory";

import type { NewPost, Post } from "@/shared/entities/post";
import type { User } from "@/shared/entities/user";

export const PostFactory = {
  build(overrides: Partial<NewPost> = {}): NewPost {
    return {
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(3),
      authorId: faker.string.uuid(),
      publishedAt: null,
      ...overrides,
    };
  },

  /**
   * Build post with associated author
   */
  buildWithAuthor(overrides: Partial<Post> = {}): Post & { author: User } {
    const author = UserFactory.buildComplete();
    return {
      id: faker.string.uuid(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...this.build({ authorId: author.id }),
      ...overrides,
      author,
    };
  },
};
```

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test src/modules/users/components/UserCard.test.tsx
```

## Do Not

- Test implementation details — test behavior and outcomes
- Skip async cleanup — always await async operations
- Mock too much — only mock external dependencies
- Write flaky tests — avoid timing-dependent assertions
- Forget edge cases — test error states and loading states
