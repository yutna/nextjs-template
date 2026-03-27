---
name: nextjs-data-access
description: Keep data access server-only, explicit, and separate from route shells and client code. Use this when designing or implementing queries, repositories, or integrations in Next.js.
---

# Next.js Data Access

Use this skill when a task touches reads, repositories, or external integrations.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [Next.js enterprise design](../../../docs/nextjs-enterprise-workflow-design.md)

## Rules

- server-only modules own database and backend integrations
- if a module uses `import "server-only"`, make sure the repository actually declares the `server-only` package
- route files call feature-level loaders or presenters, not low-level adapters
- DTOs cross feature or route boundaries, not raw records
- env access happens through the validated env module
- mapping and decision logic should stay in seams that tests can exercise without booting the transport layer when practical

## Process

1. Define the read or integration boundary.
2. Place the implementation in a server-only module and install `server-only` if the repo does not already provide it.
3. Define the DTO or contract that leaves the module.
4. Decide cache behavior and invalidation strategy.
5. Keep route shells and client islands ignorant of low-level details.
6. If standalone tests need to import the module, add an explicit `server-only` stub or isolate pure logic behind a testable boundary.

## Do not

- import repositories into client files
- return raw backend objects across the feature boundary
- let route shells become ad hoc service layers
