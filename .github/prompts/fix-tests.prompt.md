---
name: fix-tests
description: >-
  Run tests, analyze failures, fix them, and re-run
  until all pass
agent: agent
tools: ['edit/editFiles', 'search/codebase']
argument-hint: '[optional: specific test file or pattern]'
---

# Fix failing tests

Run the test suite, analyze any failures, apply fixes,
and repeat until every test passes.

## Steps

1. Run the full suite or a filtered subset:

   ```bash
   npm run test
   ```

   If `${input}` specifies a file or pattern, pass it to
   Vitest:

   ```bash
   npx vitest run ${input}
   ```

1. Read the output carefully. For each failure, identify
   the root cause before editing any file.

1. Apply the smallest fix that resolves the failure.
   Common patterns in this project:

   - Mock `"server-only"` when testing server components:

     ```typescript
     vi.mock("server-only", () => ({}));
     ```

   - Use the project test helper for rendering:

     ```typescript
     import { renderWithProviders } from "@/test/render-with-providers";
     ```

   - Mock `next-intl` server functions when they appear
     in the component under test.

1. Re-run the same test command and verify the failure is
   resolved.

1. Repeat until the full suite is green.

## Rules

- Do **not** delete or skip tests to make the suite pass.
- Do **not** change application logic unless the test
  reveals a genuine bug.
- Keep fixes scoped to the test infrastructure or the
  code that actually broke.
