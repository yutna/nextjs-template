---
name: nextjs-functional-patterns
description: Apply Effect, ts-pattern, and date helpers in ways that clarify domain logic without overcomplicating the codebase. Use this when advanced branching, error modeling, or time handling is being introduced.
---

# Next.js Functional Patterns

Use this skill when a task proposes `effect`, `ts-pattern`, or shared date helpers.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [Next.js functional patterns instruction](../../instructions/nextjs-functional-patterns.instructions.md)
- [Next.js enterprise library decisions](../../../docs/nextjs-enterprise-library-decisions.md)

## Decision rules

- choose `effect` when the workflow benefits from typed failures, retries, resource management, or composition across multiple async steps
- choose `ts-pattern` when exhaustive matching improves safety for discriminated unions or domain states
- choose named `dayjs` helpers when locale or timezone formatting must stay consistent across features

## Process

1. Describe the specific complexity that plain async functions or plain branching is failing to express well.
2. Introduce the smallest functional tool that solves that complexity.
3. Keep route shells and client leaves free of unnecessary abstraction.
4. Preserve readability for reviewers who do not live in the abstraction every day.

## Do not

- introduce `effect` as a stylistic preference without operational value
- wrap trivial branches in `ts-pattern`
- format dates ad hoc across multiple files
