---
name: Next.js Testability
description: Keep Next.js code shaped around narrow seams, isolated side effects, and automation-friendly boundaries.
applyTo: "apps/web/src/**/*,src/**/*,package.json,vitest.config.*,vitest.workspace.*,**/*.{test,spec}.*,packages/test-utils/**/*"
---
# Next.js testability

Treat testability as an architecture concern, not a cleanup step.

Rules:

- changed behavior should live behind the smallest practical seam instead of forcing full-route or full-app setup
- keep route shells, layouts, and Server Action entrypoints thin so business rules can be exercised outside framework bootstrapping
- isolate side effects such as time, randomness, env access, storage, and remote calls behind explicit modules or adapters
- keep parsing, mapping, authorization, and domain decision logic in pure or lightly wrapped functions where possible
- prefer stable typed return contracts over leaking framework objects across boundaries
- add or update test utilities, fixtures, and mocks when a new pattern would otherwise make tests noisy or brittle
- if a design makes changed behavior hard to test, treat it as a planning or architecture issue instead of normal complexity

Do not:

- hide important decision logic inline inside `page.tsx`, `layout.tsx`, or deeply nested JSX trees
- make simple behavior depend on browser-only state or framework globals when a smaller contract would work
- accept manual-only verification for behavior that should be covered by automated tests
