---
applyTo: "**/*.test.ts,**/*.test.tsx"
---

# Test Files

## Stack

- **Vitest** — test runner with globals enabled
- **Testing Library** — DOM queries and user-event simulation
- **jsdom** — browser environment
- **@testing-library/jest-dom** — DOM matchers

## File placement

Tests are colocated next to the file they test:

```txt
src/modules/orders/hooks/use-order-filters/
├── use-order-filters.ts
└── use-order-filters.test.ts

src/modules/static-pages/components/section-hero/
├── section-hero.tsx
└── section-hero.test.tsx
```

Rules:

- Name the test file after the unit: `thing-name.test.ts` or `thing-name.test.tsx`
- Use `.test.tsx` for React component tests, `.test.ts` for non-React tests
- Do not move feature tests into `src/test/`

## Shared test helpers (`src/test/`)

- `src/test/setup.ts` — global test bootstrapping (jest-dom, polyfills)
- `src/test/render-with-providers.tsx` — shared UI render helper with providers

Use `renderWithProviders` when UI tests need the app provider setup:

```ts
renderWithProviders(<DemoContent codeComment="// test" />);
```

## Server component tests

Call async server components directly and await the result:

```ts
renderWithProviders(await ScreenWelcome({ locale: "en" }));
```

## Mocking server-only imports

When importing modules guarded by `server-only`:

```ts
vi.mock("server-only", () => ({}));
```

## Mocking conventions

Use `vi.mock(...)` for module mocks:

```ts
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(),
}));
```

Use `vi.hoisted(...)` when a mock function must exist before module evaluation:

```ts
const mockReportError = vi.hoisted(() => vi.fn());
```

Clear mocks between tests when call history matters:

```ts
beforeEach(() => {
  vi.clearAllMocks();
});
```

## What to test

Test **behavior**, not implementation details.

Good assertions:

- Rendered landmark or text exists
- Helper returns expected shape
- Validation errors returned for invalid input
- Mocked dependency receives expected arguments
- State transitions produce correct results

Avoid:

- Snapshot-heavy tests as the default strategy
- Asserting implementation details with little behavioral value
- Over-mocking when rendering the real unit is straightforward

## Test descriptions

Use named descriptions that explain the expected behavior:

```ts
it("renders the hero section with translated title", () => {});
it("returns validation errors for empty input", () => {});
it("calls reportError with the error details", () => {});
```

## App Router boundary guidance

`src/app/**` is excluded from coverage. Test the layers below it:

- Screens, containers, components
- Actions, lib, hooks, utils

## Checklist

- [ ] Test file is colocated next to the unit it covers
- [ ] File named after the unit (`thing-name.test.ts(x)`)
- [ ] Testing behavior, not implementation details
- [ ] UI tests use `renderWithProviders` when providers are needed
- [ ] Server component tests call the async function directly
- [ ] `vi.mock("server-only", () => ({}))` added when needed
- [ ] `vi.hoisted(...)` used for mocks referenced in `vi.mock` factories
- [ ] Mocks cleared between tests when call history matters
- [ ] Test descriptions explain expected behavior
- [ ] Only necessary boundaries are mocked
