---
name: nextjs-state-machines
description: Use XState deliberately for explicit workflow state in Next.js client leaves. Use this when a feature has multi-step interaction, guarded transitions, retries, or recoverable async states.
---

# Next.js State Machines

Use this skill when a feature may need `xstate` or `@xstate/react`.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [Next.js state machines instruction](../../instructions/nextjs-state-machines.instructions.md)
- [Next.js testability skill](../nextjs-testability/SKILL.md)
- [Next.js enterprise library decisions](../../../docs/nextjs-enterprise-library-decisions.md)

## Good fits

- multi-step wizards
- explicit pending, success, failure, retry, and cancel states
- interactions with concurrent transitions or guarded branching
- flows where testable event/state modeling is better than ad hoc booleans

## Weak fits

- modal open/close
- one-step forms
- simple disclosure state
- primitive interaction that Chakra, Ark, or Zag already models

## Process

1. List the states, events, guards, and side effects.
2. Confirm that simpler server or local-state patterns are not enough.
3. Keep the machine in a dedicated `*.machine.*` file.
4. Keep React wiring inside the smallest client boundary.
5. Add focused automated tests for transitions and guards.

## Do not

- mix machine state with unrelated domain adapters in the same file
- bury machines inside route files
- use XState when a form post and re-render already solves the workflow
