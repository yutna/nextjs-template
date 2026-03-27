---
name: design-nextjs-feature
description: Design a server-first Next.js feature using the enterprise module and route conventions.
agent: "Planner"
argument-hint: "[feature summary or approved requirements]"
---
Create a Next.js feature design only. Do not implement.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [workflow core instructions](../instructions/workflow-core.instructions.md)
- [convention tiering skill](../skills/convention-tiering/SKILL.md)
- [Next.js MCP orchestration skill](../skills/nextjs-mcp-orchestration/SKILL.md)
- [Next.js architecture skill](../skills/nextjs-architecture/SKILL.md)
- [Next.js feature module skill](../skills/nextjs-feature-module/SKILL.md)
- [Next.js file-system governance skill](../skills/nextjs-file-system-governance/SKILL.md)
- [Next.js i18n skill](../skills/nextjs-i18n/SKILL.md)
- [Next.js routing skill](../skills/nextjs-routing/SKILL.md)
- [Next.js route registry skill](../skills/nextjs-route-registry/SKILL.md)
- [Next.js env skill](../skills/nextjs-env/SKILL.md)
- [Next.js client exceptions skill](../skills/nextjs-client-exceptions/SKILL.md)
- [Next.js state machines skill](../skills/nextjs-state-machines/SKILL.md)
- [Next.js functional patterns skill](../skills/nextjs-functional-patterns/SKILL.md)
- [Next.js UI runtime skill](../skills/nextjs-ui-runtime/SKILL.md)
- [Next.js testability skill](../skills/nextjs-testability/SKILL.md)
- [Next.js Zag.js skill](../skills/nextjs-zag-js/SKILL.md)

Required output:

1. Canonical route and URL ownership with locale-prefixed external URLs such as `/en/...` and `/th/...`
2. Feature module shape
3. Server and client boundary plan
4. Data, action, and cache strategy
5. Validation and rollback plan
6. Files in scope and approval checkpoint
7. Any design or MCP evidence used
8. i18n namespace and locale impact
9. Chakra/Ark/Zag interaction strategy where relevant
10. Testability plan and expected automated coverage seams
11. Canonical feature slug, folder shape, and file naming plan
12. Library decision notes for env, logging, client exceptions, machines, or UI runtime if any are involved
13. Convention-tier notes covering hard conventions, strong defaults, and any justified local deviations

Rules:

- keep route files thin
- prefer Server Components and Server Actions
- justify every client island and every dynamic segment
- use the profile contract and convention tiers as the reason the structure is correct, not a reference repository shape
- update [`.github/workflow-state.json`](../workflow-state.json) with planning status and files in scope
