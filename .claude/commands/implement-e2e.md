---
description: Generate Playwright E2E tests from e2e-scenarios.md specifications.
argument-hint: "[path to e2e-scenarios.md or feature name]"
---

# Implement E2E

Generate Playwright E2E tests from the E2E scenario specifications.

## Input

Read `docs/tasks/e2e-scenarios.md` (or the specified file/feature).

Artifact boundary:

- `docs/tasks/e2e-scenarios.md` is a human spec input.
- Do NOT read runtime state (`.claude/workflow-state.json`) as E2E source.
- Do NOT read session `plan.md` as E2E source unless the user explicitly asks to generate E2E from runtime plan.

If `docs/tasks/e2e-scenarios.md` does not exist, stop and report missing prerequisite.

## Output

Playwright test files in `e2e/` directory.

## Rules

### File Structure

- Group tests by feature: `e2e/<feature-name>.spec.ts`
- Use custom fixtures from `e2e/fixtures.ts` (the `localePath` helper)
- Import: `import { test, expect } from "./fixtures";`

### Test Structure

```typescript
import { expect, test } from "./fixtures";

test.describe("Feature: [Name]", () => {
  test("[Scenario title]", async ({ page, localePath }) => {
    await page.goto(localePath("/route"));

    // Interact using data-testid
    await page.getByTestId("module-component-element").click();
    await page.getByTestId("module-form-field").fill("value");

    // Assert
    await expect(page.getByTestId("module-result")).toBeVisible();
  });
});
```

### Selectors (Priority Order)

1. `data-testid` — preferred for stability
2. Accessible roles — `page.getByRole("button", { name: "Submit" })`
3. Text content — `page.getByText("Welcome")` (last resort)

### Locale Coverage

| Priority | Locale Requirement |
|----------|-------------------|
| `@must` | Test both `en` and `th` |
| `@should` | Test at least `en` |
| `@could` | Generate with `test.skip` and comment |
| `@wont` | Do not generate |

### Locale Test Pattern

```typescript
for (const locale of ["en", "th"]) {
  test(`[Scenario title] (${locale})`, async ({ page, localePath }) => {
    await page.goto(localePath("/route", locale));
    // ...
  });
}
```

### Do NOT

- Modify application source code
- Generate tests for `@wont` scenarios
- Use CSS selectors or XPath
- Use hardcoded waits (`page.waitForTimeout`)

### Do

- Use `data-testid` selectors matching convention: `<module>-<component>-<element>`
- Add setup/teardown when preconditions require it
- Report which scenarios each test file covers
