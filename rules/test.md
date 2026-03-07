# Test Style Guide

This guide defines how to write and organize tests in this repository, including:

- shared test support in `src/test`
- colocated `*.test.ts` and `*.test.tsx` files across `src/shared` and `src/modules`

Use this guide to keep tests consistent with the repository's Vitest, Testing Library, and server-first Next.js architecture.

## 1. Decide whether code belongs in `src/test` or beside the unit

Use `src/test` for shared test infrastructure reused by many tests.

Good fits:

- global test setup
- shared render helpers
- reusable wrappers or providers for tests
- test-only utilities that are intentionally cross-cutting

Current examples:

- `src/test/setup.ts`
- `src/test/render-with-providers.tsx`

Use colocated test files when the test exists to verify one specific unit.

Good fits:

- component tests
- screen tests
- lib tests
- action tests
- feature-local presenter or utility tests

Examples:

- `src/modules/static-pages/components/section-hero/section-hero.test.tsx`
- `src/modules/static-pages/screens/screen-welcome/screen-welcome.test.tsx`
- `src/shared/lib/navigation/navigation.test.ts`
- `src/shared/actions/report-error-action/report-error-action.test.ts`

Rule of thumb:

- shared test support belongs in `src/test`
- the actual test for a unit belongs beside that unit

Do **not** turn `src/test` into a dumping ground for unrelated test files. Prefer colocation first.

## 2. Testing stack and baseline assumptions

This repository currently uses:

- **Vitest**
- **Testing Library**
- **jsdom**
- **@testing-library/jest-dom**

Current configuration from `vitest.config.mts`:

- environment: `jsdom`
- globals: enabled
- setup file: `./src/test/setup.ts`
- coverage provider: `v8`

Coverage thresholds:

- statements: 80
- functions: 80
- lines: 80
- branches: 75

Coverage exclusions currently include:

- `src/test/**`
- `src/**/*.d.ts`
- `src/**/*.stories.{ts,tsx}`
- `src/**/index.ts`
- `src/app/**`

Implication:

- test meaningful behavior below route-entry files
- keep helpers in `src/test` without expecting them to count toward coverage
- do not write tests around barrel files

## 3. File placement and naming

Test files should be colocated and named after the unit they cover.

Use:

- `component-name.test.tsx` for React components
- `screen-name.test.tsx` for screens
- `thing-name.test.ts` for non-React utilities, actions, helpers, and services

Examples:

```txt
src/modules/static-pages/components/section-demo/
├── demo-content.tsx
├── demo-content.test.tsx
├── section-demo.tsx
└── section-demo.test.tsx

src/shared/lib/safe-action/
├── action-client.ts
└── action-client.test.ts
```

Rules:

- keep tests beside the implementation they verify
- keep the test filename aligned to the implementation filename
- prefer one primary test file per public unit
- do not move feature tests into `src/test` just because they are small

## 4. Responsibility of `src/test`

`src/test` is for reusable test support only.

### `setup.ts`

Use `src/test/setup.ts` for global environment configuration that should apply to the entire test suite.

Current example:

- importing `@testing-library/jest-dom`
- stubbing `IntersectionObserver` for jsdom

Good fits:

- global DOM polyfills or stubs
- framework-wide test bootstrapping
- one-time environment setup needed by many tests

Avoid putting per-test mocks or feature-specific setup in `setup.ts`.

### `render-with-providers.tsx`

Use `renderWithProviders` when UI tests need the repository's shared provider setup.

Current example:

- wrapping rendered UI with `ChakraProvider` and the custom Chakra system

Good direction:

```ts
renderWithProviders(<DemoContent codeComment="// test comment" />);
```

If a UI test needs the same app-level wrapper that many other tests need, add or update a shared helper in `src/test` instead of duplicating wrappers in many files.

## 5. UI component tests

Use colocated `*.test.tsx` files for components and screens.

Prefer testing:

- rendered output
- important landmarks
- visible text
- user-relevant structure
- key props or data flowing into the rendered UI

Current examples:

- `SectionHero` checks that a section renders and translated text appears
- `DemoContent` checks rendered comment text and visible code lines
- `ScreenWelcome` checks that all major child surfaces render

Good direction:

- assert what the user can see or interact with
- use `screen.getBy...` and related Testing Library queries where appropriate
- keep assertions focused on meaningful behavior

Avoid:

- snapshot-heavy tests as the default
- asserting implementation details that provide little behavioral value
- over-mocking when rendering the real unit is straightforward

## 6. Server component tests

This repository uses server components by default. Test async server components by calling them directly and awaiting the result.

Current direction:

```ts
renderWithProviders(await ScreenWelcome({ locale: "en" }));
```

Rules:

- call the async component function directly
- await the returned JSX
- then render the result with the appropriate helper

If the test imports server-only code, follow the repository pattern:

```ts
vi.mock("server-only", () => ({}));
```

Use this when needed so test environments can import server-only guarded modules safely.

## 7. Action and lib tests

Non-React units such as actions and library helpers should usually use `*.test.ts`.

Prefer direct unit tests for:

- action result shapes
- validation behavior
- operational vs unexpected error behavior
- pure utilities
- small shared helpers

Current examples:

- `src/shared/actions/report-error-action/report-error-action.test.ts`
- `src/shared/lib/safe-action/action-client.test.ts`
- `src/shared/lib/navigation/navigation.test.ts`

Good direction:

- call the unit directly
- mock only true external boundaries
- assert explicit return values and error outcomes

Avoid mounting React helpers just to test non-React logic.

## 8. Mocking conventions

Follow the existing mocking patterns already used in the repository.

### Use `vi.mock(...)` for module mocks

Examples already used:

- `vi.mock("server-only", () => ({}))`
- `vi.mock("next-intl/server", ...)`
- `vi.mock("@/shared/lib/error-reporter", ...)`

### Use `vi.hoisted(...)` when a mock function must exist before module evaluation

Current pattern:

```ts
const mockReportError = vi.hoisted(() => vi.fn());
```

Use this for mock functions referenced inside `vi.mock(...)` factories.

### Clear mocks between tests when needed

Current pattern:

```ts
beforeEach(() => {
  vi.clearAllMocks();
});
```

Do this when multiple tests share the same mocked module and call history matters.

## 9. Imports and test readability

Vitest globals are enabled, but the current codebase commonly imports `describe`, `it`, `expect`, and `vi` explicitly.

Follow the existing local style of the surrounding tests:

- if nearby tests import Vitest helpers explicitly, stay consistent
- prefer readable, intentional imports over mixing styles arbitrarily

For test helpers:

- import shared helpers from `@/test/...`
- import the unit under test from its colocated path

## 10. What to assert

Prefer assertions that express behavior clearly.

Good assertions:

- rendered landmark exists
- translated text is shown
- helper returns the expected shape
- validation errors are returned for invalid input
- mocked dependency receives the expected arguments

Examples from the repository:

- `expect(screen.getByText("title")).toBeInTheDocument()`
- `expect(result?.validationErrors).toBeDefined()`
- `expect(mockReportError).toHaveBeenCalledWith(...)`

Avoid tests that only restate trivial implementation with little confidence gain.

## 11. App Router boundary guidance

Because `src/app/**` is thin route-entry code and excluded from coverage, prefer testing the layers below it:

- screens
- containers
- components
- actions
- lib

Do not over-invest in unit tests for thin route boundary files when the meaningful behavior lives in deeper layers.

## 12. Example structure

Shared test support:

```txt
src/test/
├── render-with-providers.tsx
└── setup.ts
```

Colocated UI tests:

```txt
src/modules/static-pages/components/section-hero/
├── section-hero.tsx
└── section-hero.test.tsx
```

Colocated non-UI tests:

```txt
src/shared/lib/safe-action/
├── action-client.ts
└── action-client.test.ts
```

## 13. Checklist

Before adding a test, check:

- should this be a shared helper in `src/test`, or a colocated unit test?
- is the test file named after the unit it covers?
- am I testing meaningful behavior rather than trivia?
- should UI rendering use `renderWithProviders`?
- does this server-side test need `vi.mock("server-only", () => ({}))`?
- should a mocked function be created with `vi.hoisted(...)`?
- am I mocking only the necessary boundaries?
- does the test follow the surrounding file's existing style?

## 14. Quick reference

Use this:

```txt
src/test/setup.ts                       # global test bootstrapping
src/test/render-with-providers.tsx     # shared UI render helper
src/**/thing-name.test.ts              # colocated non-UI test
src/**/thing-name.test.tsx             # colocated React/UI test
```

Remember:

- colocate tests with the unit
- keep `src/test` for shared support only
- use `renderWithProviders` for shared UI provider setup
- call async server components directly in tests
- mock `server-only` when importing server-guarded modules
