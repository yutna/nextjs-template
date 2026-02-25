# Testing Setup

Complete setup guide for `vitest` + `@testing-library/react` in this project.

## Current State

`vitest.config.mts` is minimal — only `environment: "jsdom"` is configured. As a result:

- `@testing-library/jest-dom` matchers (`.toBeInTheDocument()`, `.toHaveValue()`, etc.) are **not globally available** — they must be imported manually in every test file.
- No `setupFiles` registered.
- No global assert helpers (`globals: true` is not set, so `describe`/`it`/`expect` must be imported explicitly per file).
- No coverage configuration.
- No `@testing-library/user-event` for realistic user interaction simulation.
- No `@vitest/coverage-v8` for coverage reports.

All existing tests are **pure unit tests** (no `render()`), so the missing setup has not caused failures yet.

## Packages to Install

```bash
npm install -D @testing-library/user-event @vitest/coverage-v8
```

### Resulting dev dependencies

| Package | Purpose |
| --- | --- |
| `@testing-library/user-event` | Realistic browser event simulation (`userEvent.click()`, `userEvent.type()`) |
| `@vitest/coverage-v8` | V8 native coverage provider — fast, no instrumentation overhead |

The following are already installed and do not need reinstalling:

- `vitest`
- `@testing-library/react`
- `@testing-library/dom`
- `@vitejs/plugin-react`
- `vite-tsconfig-paths`
- `jsdom`

## Step 1 — Create `src/test/setup.ts`

This file runs once before every test suite, extending vitest's `expect` with `@testing-library/jest-dom` matchers.

```ts
// src/test/setup.ts
import "@testing-library/jest-dom";
```

That single import is enough. `@testing-library/jest-dom` automatically detects vitest and patches `expect`.

## Step 2 — Update `vitest.config.mts`

Replace the current minimal config with a full production-ready configuration:

```ts
// vitest.config.mts
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/test/**",
        "src/**/*.d.ts",
        "src/**/*.stories.{ts,tsx}",
        "src/**/index.ts",
        "src/app/**",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
```

### Key options explained

| Option | Value | Why |
| --- | --- | --- |
| `globals` | `true` | `describe`, `it`, `expect`, `vi` are injected globally — no import needed per file |
| `setupFiles` | `["./src/test/setup.ts"]` | Runs before every test suite, registers jest-dom matchers |
| `coverage.provider` | `"v8"` | Fastest option; uses Node.js built-in V8 coverage — no Babel instrumentation |
| `coverage.include` | `src/**` | Only measure coverage for source files |
| `coverage.exclude` | `src/app/**` etc. | Exclude Next.js page/layout files (hard to test in jsdom) and barrel files |
| `coverage.thresholds` | 80/75 | Fail CI if coverage drops below these percentages |

## Step 3 — Add npm Scripts to `package.json`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

`test:watch` uses vitest's interactive watch mode (HMR-driven re-runs on file save).

## Step 4 — Add `.gitignore` Entries

```gitignore
# Coverage output
coverage/
```

## Writing Tests

### Unit test (no React)

```ts
// src/shared/lib/dayjs/dayjs.test.ts  ← already exists, follows this pattern
import { describe, expect, it } from "vitest";
// or — after globals: true — just use describe/it/expect directly without imports

import { dayjs } from "@/shared/lib/dayjs";

describe("dayjs", () => {
  it("formats a date", () => {
    expect(dayjs("2026-01-01").format("YYYY")).toBe("2026");
  });
});
```

### React component test

```tsx
// src/shared/components/my-component/my-component.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MyComponent } from "./my-component";

describe("MyComponent", () => {
  it("renders the label", () => {
    render(<MyComponent label="Hello" />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("calls onClick when button is clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<MyComponent label="Click me" onClick={handleClick} />);
    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### Server-only module test

Server-only modules use `import "server-only"` which throws in jsdom. Mock it:

```ts
// src/shared/lib/safe-action/safe-action.test.ts  ← already follows this pattern
vi.mock("server-only", () => ({}));
```

Add this mock at the top of any test that imports a server-only module.

### Server Action test pattern

```ts
// src/modules/auth/actions/login.test.ts
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

// Mock next-intl server-side helpers if needed
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));
```

## Directory Structure After Setup

```text
src/
  test/
    setup.ts           ← global test bootstrapping
  shared/
    lib/
      dayjs/
        dayjs.test.ts  ← existing
      logger/
        logger.test.ts ← existing
      safe-action/
        safe-action.test.ts ← existing
      navigation/
        navigation.test.ts  ← existing
coverage/              ← generated by `npm run test:coverage` (git-ignored)
```

## TypeScript Note

`@testing-library/jest-dom` ships its own types. To ensure TypeScript picks them up, `tsconfig.json`'s `types` array should include `@testing-library/jest-dom`. Check if the project's `tsconfig.json` already has:

```json
{
  "compilerOptions": {
    "types": ["@testing-library/jest-dom"]
  }
}
```

If the `types` array is absent (meaning TypeScript picks up all `@types/*` packages automatically), no change is needed.
