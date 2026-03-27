---
name: nextjs-client-boundary
description: Keep client code small, intentional, and justified. Use this when a task proposes hooks, interactivity, optimistic UI, or client-owned URL state.
---

# Next.js Client Boundary

Use this skill when reviewing or planning client islands.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [Next.js enterprise design](../../../docs/nextjs-enterprise-workflow-design.md)
- [Next.js client exceptions skill](../nextjs-client-exceptions/SKILL.md)
- [Next.js Zag.js skill](../nextjs-zag-js/SKILL.md)

## Approval questions

- why must this code run in the browser?
- can the interaction be expressed with a form and Server Action instead?
- can URL or view state stay server-owned?
- can the client boundary move lower in the tree?

## Allowed uses

- browser-only APIs
- rich local interaction that cannot be expressed server-first
- controlled optimistic UI with a clear user benefit
- narrow URL state ownership when justified
- approved `swr`, `nuqs`, or `@xstate/react` usage when the plan recorded why the server-first path was insufficient
- Chakra UI, Ark UI, or Zag.js-backed primitives that require explicit client interaction

## Do not

- mark whole feature trees or layouts as client code by default
- move fetching client-side because it feels easier
- expand a client island beyond the smallest interactive leaf
- use `swr`, `nuqs`, or XState without first proving why the route, form, or Server Action boundary is not enough
- replace existing Chakra or Ark primitives with bespoke client state without a concrete reason
