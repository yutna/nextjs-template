---
name: nextjs-security-review
description: Review Next.js work for auth gaps, unsafe mutations, env leakage, and accidental data exposure. Use this during Review or Verification for sensitive changes.
---

# Next.js Security Review

Use this skill when a task changes auth, data access, Route Handlers, Server Actions, or sensitive UI flows.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [Next.js enterprise design](../../../docs/nextjs-enterprise-workflow-design.md)

## Checklist

- every mutation authorizes on the server
- every input is validated
- env access is centralized
- no server-only imports leak into client code
- route handlers exist only where an HTTP boundary is real
- DTOs do not expose internal-only fields
- cache and revalidation do not reveal private data across scopes

## Do not

- bury security findings under style feedback
- assume a Server Action is safe just because it is server-side
