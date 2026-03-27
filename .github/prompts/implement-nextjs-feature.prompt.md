---
name: implement-nextjs-feature
description: Implement an approved Next.js feature while preserving server-first architecture and module consistency.
agent: "Implementer"
argument-hint: "[approved Next.js feature plan]"
---
Implement the approved Next.js feature without expanding scope.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [Convention tiering skill](../skills/convention-tiering/SKILL.md)
- [state sync skill](../skills/state-sync/SKILL.md)
- [Next.js feature module skill](../skills/nextjs-feature-module/SKILL.md)
- [Next.js file-system governance skill](../skills/nextjs-file-system-governance/SKILL.md)
- [Next.js data access skill](../skills/nextjs-data-access/SKILL.md)
- [Next.js Server Actions skill](../skills/nextjs-server-actions/SKILL.md)
- [Next.js i18n skill](../skills/nextjs-i18n/SKILL.md)
- [Next.js route registry skill](../skills/nextjs-route-registry/SKILL.md)
- [Next.js env skill](../skills/nextjs-env/SKILL.md)
- [Next.js logging skill](../skills/nextjs-logging/SKILL.md)
- [Next.js client exceptions skill](../skills/nextjs-client-exceptions/SKILL.md)
- [Next.js state machines skill](../skills/nextjs-state-machines/SKILL.md)
- [Next.js functional patterns skill](../skills/nextjs-functional-patterns/SKILL.md)
- [Next.js UI runtime skill](../skills/nextjs-ui-runtime/SKILL.md)
- [Next.js Storybook harness skill](../skills/nextjs-storybook-harness/SKILL.md)
- [Next.js testability skill](../skills/nextjs-testability/SKILL.md)
- [Next.js Zag.js skill](../skills/nextjs-zag-js/SKILL.md)

Required output:

1. What was implemented
2. Files changed
3. Tests added or updated
4. Route, cache, and mutation notes
5. Recommended next review or verification step
6. Route-registry or Storybook support changes
7. Translation files or locale coverage updated
8. Chakra/Ark/Zag usage notes where relevant
9. Testability notes and any new seams, stubs, or fixtures
10. File-system or naming decisions confirmed
11. Library-decision notes for env, logging, client exceptions, state machines, or UI runtime if used
12. Convention-tier notes confirming hard conventions preserved and any planned strong-default deviations followed as approved

Rules:

- keep route files thin and business logic in feature modules
- preserve the approved route and module design
- preserve hard conventions and do not improvise new structural defaults during implementation
- do not widen client boundaries without a recorded reason
- keep [`.github/workflow-state.json`](../workflow-state.json) current while implementing
