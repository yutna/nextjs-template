---
name: project-testing
description: >
  Project testing conventions using Vitest and Testing Library. Use when writing,
  modifying, or reviewing test files (*.test.ts, *.test.tsx). Covers colocated
  test structure, renderWithProviders helper, server-only mocking with vi.mock,
  vi.hoisted patterns, and test naming conventions.
---

# Project Testing Conventions

This skill covers the testing architecture for the repository, including test
organization, Vitest configuration, Testing Library patterns, and mocking
conventions.

## Testing Approach

This project uses **Vitest** with **Testing Library** and **jsdom** for
testing. Tests are colocated with the units they verify. Shared test
infrastructure lives in `src/test`.

### Testing Stack

- **Vitest** — test runner
- **Testing Library** — DOM queries and user interaction
- **jsdom** — browser environment simulation
- **@testing-library/jest-dom** — DOM assertion matchers

### Vitest Configuration

From `vitest.config.mts`:

- environment: `jsdom`
- globals: enabled
- setup file: `./src/test/setup.ts`
- coverage provider: `v8`

Coverage thresholds:

- statements: 80
- functions: 80
- lines: 80
- branches: 75

Coverage exclusions:

- `src/test/**`
- `src/**/*.d.ts`
- `src/**/*.stories.{ts,tsx}`
- `src/**/index.ts`
- `src/app/**`

## Test Organization

### Colocated Tests

Tests live beside the implementation they verify:

```text
src/modules/static-pages/components/section-hero/
├── section-hero.tsx
└── section-hero.test.tsx

src/shared/lib/safe-action/
├── action-client.ts
└── action-client.test.ts
```

Rules:

- keep tests beside the implementation they verify
- keep the test filename aligned to the implementation filename
- prefer one primary test file per public unit
- do not move feature tests into `src/test` just because they are small

### File Naming

- `component-name.test.tsx` for React components
- `screen-name.test.tsx` for screens
- `thing-name.test.ts` for non-React utilities, actions, helpers, and services

### Shared Test Support (`src/test`)

Use `src/test` for reusable test infrastructure only:

```text
src/test/
├── render-with-providers.tsx
└── setup.ts
```

Good fits:

- global test setup
- shared render helpers
- reusable wrappers or providers for tests
- test-only utilities that are intentionally cross-cutting

Do **not** turn `src/test` into a dumping ground for unrelated test files.
Prefer colocation first.

## Key Patterns

### `setup.ts` — Global Test Setup

Use `src/test/setup.ts` for global environment configuration:

- importing `@testing-library/jest-dom`
- stubbing `IntersectionObserver` for jsdom
- global DOM polyfills or stubs
- framework-wide test bootstrapping

Avoid putting per-test mocks or feature-specific setup in `setup.ts`.

### `renderWithProviders` — Shared UI Render Helper

Use `renderWithProviders` when UI tests need the repository's shared provider
setup (e.g., `ChakraProvider` with the custom Chakra system).

```ts
renderWithProviders(<DemoContent codeComment="// test comment" />);
```

If a UI test needs the same app-level wrapper that many other tests need, add
or update a shared helper in `src/test` instead of duplicating wrappers.

### Server Component Tests

Test async server components by calling them directly and awaiting the result:

```ts
renderWithProviders(await ScreenWelcome({ locale: "en" }));
```

Rules:

- call the async component function directly
- await the returned JSX
- then render the result with the appropriate helper

### Mocking `server-only`

When a test imports server-only code, follow the repository pattern:

```ts
vi.mock("server-only", () => ({}));
```

Use this so test environments can import server-only guarded modules safely.

### `vi.hoisted` for Mock Functions

Use `vi.hoisted(...)` when a mock function must exist before module evaluation:

```ts
const mockReportError = vi.hoisted(() => vi.fn());
```

Use this for mock functions referenced inside `vi.mock(...)` factories.

### `vi.mock` for Module Mocks

Examples already used in the repository:

```ts
vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(),
}));
vi.mock("@/shared/lib/error-reporter", () => ({
  reportError: mockReportError,
}));
```

### Clearing Mocks Between Tests

Clear mocks when multiple tests share the same mocked module and call history
matters:

```ts
beforeEach(() => {
  vi.clearAllMocks();
});
```

## What to Test

### UI Component Tests

Prefer testing:

- rendered output
- important landmarks
- visible text
- user-relevant structure
- key props or data flowing into the rendered UI

Good direction:

- assert what the user can see or interact with
- use `screen.getBy...` and related Testing Library queries
- keep assertions focused on meaningful behavior

Avoid:

- snapshot-heavy tests as the default
- asserting implementation details that provide little behavioral value
- over-mocking when rendering the real unit is straightforward

### Action and Lib Tests

Non-React units such as actions and library helpers should use `*.test.ts`.

Prefer direct unit tests for:

- action result shapes
- validation behavior
- operational vs unexpected error behavior
- pure utilities
- small shared helpers

Good direction:

- call the unit directly
- mock only true external boundaries
- assert explicit return values and error outcomes

Avoid mounting React helpers just to test non-React logic.

### Good Assertions

- rendered landmark exists
- translated text is shown
- helper returns the expected shape
- validation errors are returned for invalid input
- mocked dependency receives the expected arguments

Examples from the repository:

```ts
expect(screen.getByText("title")).toBeInTheDocument();
expect(result?.validationErrors).toBeDefined();
expect(mockReportError).toHaveBeenCalledWith(/* ... */);
```

Avoid tests that only restate trivial implementation with little confidence
gain.

## App Router Boundary Guidance

Because `src/app/**` is thin route-entry code and excluded from coverage,
prefer testing the layers below it:

- screens
- containers
- components
- actions
- lib

Do not over-invest in unit tests for thin route boundary files when the
meaningful behavior lives in deeper layers.

## Imports and Readability

Vitest globals are enabled, but the current codebase commonly imports
`describe`, `it`, `expect`, and `vi` explicitly.

Follow the existing local style of the surrounding tests:

- if nearby tests import Vitest helpers explicitly, stay consistent
- prefer readable, intentional imports over mixing styles arbitrarily

For test helpers:

- import shared helpers from `@/test/...`
- import the unit under test from its colocated path

## Common Mistakes

- Moving feature tests into `src/test` instead of colocating them
- Using snapshot tests as the primary testing strategy
- Over-mocking when rendering the real unit is straightforward
- Putting per-test mocks or feature-specific setup in `setup.ts`
- Mounting React helpers just to test non-React logic
- Testing thin route boundary files instead of the meaningful layers beneath
- Duplicating provider wrappers across tests instead of using
  `renderWithProviders`
- Forgetting `vi.mock("server-only", () => ({}))` when testing server-guarded
  modules
- Not using `vi.hoisted(...)` for mock functions referenced in `vi.mock(...)`
  factories

## Decision Checklist

Before writing a test, check:

- should this be a shared helper in `src/test`, or a colocated unit test?
- is the test file named after the unit it covers?
- am I testing meaningful behavior rather than trivia?
- should UI rendering use `renderWithProviders`?
- does this server-side test need `vi.mock("server-only", () => ({}))`?
- should a mocked function be created with `vi.hoisted(...)`?
- am I mocking only the necessary boundaries?
- does the test follow the surrounding file's existing style?

## Quick Reference

```text
src/test/setup.ts                     # global test bootstrapping
src/test/render-with-providers.tsx    # shared UI render helper
src/**/thing-name.test.ts             # colocated non-UI test
src/**/thing-name.test.tsx            # colocated React/UI test
```

Remember:

- colocate tests with the unit
- keep `src/test` for shared support only
- use `renderWithProviders` for shared UI provider setup
- call async server components directly in tests
- mock `server-only` when importing server-guarded modules

## References

- [Test Patterns Guide](references/test-patterns.md) — full testing
  conventions and detailed patterns
