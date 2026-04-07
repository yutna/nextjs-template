---
name: nextjs-testing
description: This skill should be used when writing tests, using Vitest, or implementing Testing Library patterns. Guides Vitest and Testing Library setup.
---

# Next.js Testing

Use this skill when writing tests with Vitest and Testing Library.

## Reference

- .claude/workflow-profile.json (stack.testing)
- vitest.config.mts (Vitest configuration)
- src/test/setup.ts
- src/test/storybook-setup.ts
- src/test/render-with-providers.tsx

## Vitest Setup

### Configuration

```typescript
// vitest.config.mts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    projects: [
      {
        test: {
          include: ["src/**/*.test.{ts,tsx}", "eslint/**/*.test.ts"],
          name: "unit",
          setupFiles: ["./src/test/setup.ts"],
        },
      },
      {
        test: {
          include: ["src/test/stories-smoke.test.tsx"],
          name: "storybook",
          setupFiles: ["./src/test/storybook-setup.ts"],
        },
      },
    ],
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
```

### Test Setup

```typescript
// src/test/setup.ts
import "@testing-library/jest-dom";
import { beforeEach, vi } from "vitest";

import "./setup-db";

class IntersectionObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);

const originalError = console.error.bind(console);
const originalWarn = console.warn.bind(console);

beforeEach(() => {
  console.error = (...args: Parameters<typeof console.error>) => {
    originalError(...args);
    throw new Error(`Unexpected console.error in test.\n\n${String(args[0])}`);
  };

  console.warn = (...args: Parameters<typeof console.warn>) => {
    originalWarn(...args);
    throw new Error(`Unexpected console.warn in test.\n\n${String(args[0])}`);
  };
});
```

## Component Testing

### Testing Server Components

```tsx
// src/modules/users/components/card-user/card-user.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CardUser } from './card-user';

describe('CardUser', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  };

  it('renders user information', () => {
    render(<CardUser user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('displays avatar with user initials', () => {
    render(<CardUser user={mockUser} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});
```

### Testing Client Components

```tsx
// src/modules/users/containers/container-user-form/container-user-form.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { createUserAction } from '@/modules/users/actions/create-user-action/create-user-action';
import { ContainerUserForm } from './container-user-form';

// Mock the server action
vi.mock('@/modules/users/actions/create-user-action/create-user-action', () => ({
  createUserAction: vi.fn(),
}));

describe('ContainerUserForm', () => {
  it('submits form with user data', async () => {
    const user = userEvent.setup();
    const mockCreateUser = vi.mocked(createUserAction);
    mockCreateUser.mockResolvedValue({ data: { success: true } });

    render(<ContainerUserForm />);

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
    const mockCreateUser = vi.mocked(createUserAction);
    mockCreateUser.mockResolvedValue({
      validationErrors: {
        email: { _errors: ['Invalid email'] },
      },
    });

    render(<ContainerUserForm />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });
});
```

### Testing Hooks

```tsx
// src/modules/users/hooks/use-user-filters/use-user-filters.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useUserFilters } from './use-user-filters';

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
// src/modules/users/actions/create-user-action/create-user-action.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createUserAction } from "./create-user-action";

vi.mock(
  "@/modules/users/services/create-user-service/create-user-service",
  () => ({
    createUserService: vi.fn(),
  }),
);

import { createUserService } from "@/modules/users/services/create-user-service/create-user-service";

describe("createUserAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success data when the service resolves", async () => {
    vi.mocked(createUserService).mockResolvedValue({
      email: "john@example.com",
      id: "1",
      name: "John",
    });

    const result = await createUserAction({
      email: "john@example.com",
      name: "John",
    });

    expect(result.data?.success).toBe(true);
  });
});
```

## Testing Utilities

### Custom Render

```tsx
// src/test/render-with-providers.tsx
import { ChakraProvider } from "@chakra-ui/react";
import { render } from "@testing-library/react";

import { system } from "@/shared/vendor/chakra-ui/system";

import type { RenderOptions } from "@testing-library/react";
import type { ReactNode } from "react";

function Wrapper({ children }: { children: ReactNode }) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}

export function renderWithProviders(
  ui: ReactNode,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: Wrapper, ...options });
}
```

## Test Data Helpers

This repo does not currently ship a canonical `shared/factories/` layer.
Prefer the smallest fixture seam that matches the test:

1. Inline fixtures for one-off tests
2. A colocated `fixtures.ts` next to the test seam when reused across files
3. Mock data shaped to the public contract under test, not the whole database row

```typescript
// src/modules/users/components/card-user/fixtures.ts
export const sampleUser = {
  email: "john@example.com",
  id: "user-1",
  name: "John Doe",
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
npm run test -- src/modules/users/components/card-user/card-user.test.tsx
```

## Do Not

- Test implementation details — test behavior and outcomes
- Skip async cleanup — always await async operations
- Mock too much — only mock external dependencies
- Write flaky tests — avoid timing-dependent assertions
- Forget edge cases — test error states and loading states
