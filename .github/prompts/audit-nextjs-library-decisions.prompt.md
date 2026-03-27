---
name: audit-nextjs-library-decisions
description: Review whether library choices in a Next.js implementation match the enterprise server-first profile.
agent: "Reviewer"
argument-hint: "[changed scope or feature summary]"
---
Review the library choices in the changed Next.js implementation.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [Next.js env skill](../skills/nextjs-env/SKILL.md)
- [Next.js logging skill](../skills/nextjs-logging/SKILL.md)
- [Next.js client exceptions skill](../skills/nextjs-client-exceptions/SKILL.md)
- [Next.js state machines skill](../skills/nextjs-state-machines/SKILL.md)
- [Next.js functional patterns skill](../skills/nextjs-functional-patterns/SKILL.md)
- [Next.js UI runtime skill](../skills/nextjs-ui-runtime/SKILL.md)

Required output:

1. Findings ordered by severity
2. Libraries that fit the profile well
3. Libraries that were unnecessary or misapplied
4. Missing tests, runtime evidence, or migration notes
5. Whether the task can proceed or must return to Planning or Implementation

Rules:

- findings come first
- prioritize server-first violations, client-exception drift, env or secret handling mistakes, and over-abstracted state-management choices
- do not implement broad fixes in review mode
