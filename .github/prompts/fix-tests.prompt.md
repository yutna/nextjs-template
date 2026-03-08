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

Run `npm run test` (or `npx vitest run ${input}` if a pattern is given).
For each failure, identify the root cause before editing. Apply the smallest
fix. Re-run until green.

Rules:
- Do not delete or skip tests
- Do not change application logic unless the test reveals a genuine bug
- Keep fixes scoped to test infrastructure or the code that actually broke
