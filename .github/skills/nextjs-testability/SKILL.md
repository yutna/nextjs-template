---
name: nextjs-testability
description: Design and review Next.js code so changed behavior stays easy to exercise through automated tests. Use this during Planning, Implementation, Review, or Verification when code shape affects coverage.
---

# Next.js Testability

Use this skill when a Next.js task changes behavior, boundaries, or verification strategy.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [Next.js testability instruction](../../instructions/nextjs-testability.instructions.md)
- [Next.js enterprise design](../../../docs/nextjs-enterprise-workflow-design.md)
- [Next.js testability playbook](../../../docs/nextjs-enterprise-testability-playbook.md)

## Core checks

- can the changed behavior be exercised without booting the entire app?
- are route files and action entrypoints thin enough to delegate to testable modules?
- are side effects isolated behind explicit adapters or helper modules?
- do tests target behavior contracts instead of fragile implementation details?
- does browser verification supplement automated tests instead of replacing them?

## Process

1. Identify the changed behavior and the smallest seam that should own it.
2. Extract parsing, validation, mapping, authorization, and domain decisions out of route shells or UI wrappers when needed.
3. Isolate side effects so unit or integration tests can control them.
4. Decide the minimum useful automated coverage: unit, module integration, Server Action, or browser verification.
5. Add or update fixtures, test helpers, and stubs that keep the coverage readable.
6. Record any remaining testability debt explicitly if a broader refactor is out of scope.

## Good targets for extraction

- search-param normalization
- DTO mapping and formatting
- authorization and capability checks
- mutation result shaping
- presentational view-model building
- state-machine or interaction helpers that power client leaves

## Do not

- require a full rendered route to test a simple mapper or decision branch
- bury mutation rules directly inside JSX event handlers
- rely on browser QA alone when stable automated coverage is practical
