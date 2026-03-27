---
name: Next.js State Machines
description: Use XState only for explicit client workflow state when simpler form, route, or primitive state is not enough.
applyTo: "apps/web/src/**/*.{ts,tsx},src/**/*.{ts,tsx}"
---
# Next.js state machines

State machines are a deliberate escalation, not the default state model.

Rules:

- use `xstate` and `@xstate/react` only when the workflow has explicit states, guarded transitions, recovery paths, or concurrency that should be modeled directly
- keep machine definitions in dedicated `*.machine.ts` or `*.machine.tsx` files
- keep UI wiring with `@xstate/react` inside narrow client leaves
- keep machine transitions and events domain-named and testable without full route rendering when practical
- prefer forms, Server Actions, route state, Chakra or Zag primitives, or small local state when they already solve the problem cleanly

Do not:

- use XState for a simple toggle, tab selection, or one-step form
- hide machine definitions inside route shells
- mix page-level business workflows into primitive UI machines
