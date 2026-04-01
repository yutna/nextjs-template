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

### Mock Factories

```typescript
// src/test/factories.ts
import { faker } from '@faker-js/faker';

export function createMockUser(overrides = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    createdAt: faker.date.past(),
    ...overrides,
  };
}

export function createMockUsers(count: number) {
  return Array.from({ length: count }, () => createMockUser());
}
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
