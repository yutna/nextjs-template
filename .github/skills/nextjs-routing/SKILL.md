---
name: nextjs-routing
description: Design and review Next.js App Router trees, URL semantics, layout boundaries, and advanced routing usage. Use this during Planning, Review, and Verification when route structure matters.
---

# Next.js Routing

Use this skill whenever a task creates, changes, or reviews route structure.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [Next.js enterprise design](../../../docs/nextjs-enterprise-workflow-design.md)
- [workflow state](../../workflow-state.json)
- [Next.js route-registry skill](../nextjs-route-registry/SKILL.md)

## Routing questions

Answer these before implementation:

1. What is the canonical URL?
   It should be expressed as locale-prefixed external URLs such as `/en/customers` and `/th/customers` for visible app routes.
2. Which layout owns the shell?
3. What belongs in path segments vs `searchParams`?
4. Are dynamic segments necessary?
5. Are route groups needed only for layout or product-area boundaries?
6. Are `loading`, `error`, `not-found`, or `template` files required?
7. Are parallel or intercepting routes truly required?
8. Does the shared route registry need new helpers?

## Best-practice rules

- path segments express resource identity and hierarchy
- user-facing segment names use lowercase kebab-case
- visible application route trees should place pages under a `[locale]` boundary
- `searchParams` express reversible view state
- route groups express shell boundaries without polluting URLs
- dynamic segments should be stable and intentional
- route handlers are for real HTTP boundaries, not internal UI mutations

## Review checklist

- URL reads like product language, not technical language
- layouts match real shell changes
- advanced routing features are justified
- route files stay thin
- route tree does not force unnecessary client work
- reusable URLs can be represented through shared route helpers
- route segment and helper family names stay aligned with canonical slugs

## Do not

- use catch-all routes casually
- leak team or folder names into URLs
- solve routing complexity with nested client state by default
