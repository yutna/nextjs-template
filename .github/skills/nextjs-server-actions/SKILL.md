---
name: nextjs-server-actions
description: Implement secure Server Actions with zod validation, authorization, and explicit revalidation. Use this when a Next.js feature mutates data.
---

# Next.js Server Actions

Use this skill when a feature writes data from the UI.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [Next.js enterprise design](../../../docs/nextjs-enterprise-workflow-design.md)

## Process

1. Define the mutation contract and validate it with `zod`.
2. Authorize on the server before performing the write.
3. Perform the mutation in a server-owned module.
4. Revalidate affected cache tags or paths explicitly.
5. Return a stable typed result for the UI boundary.
6. Keep validation, authorization, and result-shaping logic easy to exercise through focused automated tests.

## Preferred patterns

- use `next-safe-action`
- prefer `<form action={...}>`
- keep action files focused on one mutation workflow
- record cache invalidation alongside the mutation plan

## Do not

- trust client-derived authorization state
- hide writes inside route shells
- skip revalidation decisions
