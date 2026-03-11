---
name: Next.js Template Architecture
description: Repo-specific architecture guardrails for source changes in the Next.js template.
applyTo: "src/**/*"
---
# Next.js template architecture

Keep repo-specific source changes aligned to the existing template shape:

- prefer server-first App Router work
- preserve the `page -> screen -> container -> component` ownership flow
- keep route entries and route-boundary layouts thin
- use `"use client"` only at the smallest leaf that truly needs client behavior
- keep app-wide client providers isolated in shared provider surfaces
- keep user-facing paths on shared route helpers under `src/shared/routes/` instead of duplicating strings
- keep environment access centralized in `src/shared/config/env.ts`
- keep user-facing text aligned across both supported locales

Prefer the stack choices that already exist in the template when the task touches those surfaces:

- Chakra UI or Ark UI for UI primitives
- Zod for validation
- `next-safe-action` for server actions
- `nuqs` for URL-driven client state

Load deeper procedures on demand instead of expanding this file:

- [local runtime bootstrap](../skills/local-runtime-bootstrap/SKILL.md)
- [Next.js template patterns](../skills/nextjs-template-patterns/SKILL.md)
- [rendered UI verification](../skills/rendered-ui-verification/SKILL.md)
- [repo readiness](../skills/repo-readiness/SKILL.md)
