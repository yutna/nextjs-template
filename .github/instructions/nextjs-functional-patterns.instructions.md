---
name: Next.js Functional Patterns
description: Use Effect, ts-pattern, and date utilities deliberately so they clarify domain logic instead of taking over the codebase.
applyTo: "apps/web/src/**/*.{ts,tsx},src/**/*.{ts,tsx}"
---
# Next.js functional patterns

Functional helpers are optional accelerators, not architecture defaults.

Rules:

- use `effect` only when a workflow benefits from typed errors, resource safety, retries, composable async steps, or explicit dependency boundaries
- keep `effect` out of route shells and client leaves unless the plan explicitly requires it
- use `ts-pattern` for discriminated unions, exhaustive matching, and multi-branch domain decisions
- use `dayjs` through named formatting or parsing helpers when locale or timezone behavior must stay consistent
- keep helper abstractions readable to teammates who do not think in advanced functional patterns every day

Do not:

- introduce `effect` for straightforward request-response flows that read clearly with plain async functions
- replace simple `if` or `switch` branches with `ts-pattern` when exhaustiveness is not providing value
- scatter ad hoc date parsing or timezone assumptions across the UI
