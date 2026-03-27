---
name: nextjs-client-exceptions
description: Decide when SWR, nuqs, and client helper libraries are justified in a server-first Next.js app. Use this during Planning, Review, or Migration when browser-owned state is being proposed.
---

# Next.js Client Exceptions

Use this skill when a task proposes client-side state or fetching libraries.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [Next.js client exceptions instruction](../../instructions/nextjs-client-exceptions.instructions.md)
- [Next.js client boundary skill](../nextjs-client-boundary/SKILL.md)
- [Next.js enterprise library decisions](../../../docs/nextjs-enterprise-library-decisions.md)

## Decision order

1. Can Server Components and route params own the read flow?
2. Can a Server Action plus revalidation own the mutation flow?
3. Can plain local component state own the interaction?
4. If not, does the browser need URL-owned state through `nuqs`?
5. If not, does the browser need client cache orchestration through `swr`?

## Guidance

- use `swr` for interactive browser caches, optimistic patches, or refresh loops that are genuinely browser-owned
- use `nuqs` when search state should round-trip through the URL during active client interaction
- use `immer`, `use-immer`, or `usehooks-ts` only to simplify a narrow client leaf, not to reshape feature architecture

## Do not

- adopt `swr` as the default data access layer
- introduce `nuqs` without defining the route contract first
- hide a server design problem under a client helper library
