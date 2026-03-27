---
name: design-nextjs-routes
description: Design or refactor a Next.js App Router tree with explicit URL, layout, and segment decisions.
agent: "Planner"
argument-hint: "[route area, workflow, or feature]"
---
Design the route tree before implementation.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [workflow core instructions](../instructions/workflow-core.instructions.md)
- [Convention tiering skill](../skills/convention-tiering/SKILL.md)
- [Next.js i18n skill](../skills/nextjs-i18n/SKILL.md)
- [Next.js routing skill](../skills/nextjs-routing/SKILL.md)
- [Next.js route registry skill](../skills/nextjs-route-registry/SKILL.md)
- [Next.js file-system governance skill](../skills/nextjs-file-system-governance/SKILL.md)
- [Next.js testability skill](../skills/nextjs-testability/SKILL.md)

Required output:

1. Canonical URL map with locale-prefixed examples such as `/en/...` and `/th/...`
2. Route groups and layout boundaries
3. Dynamic segment and `searchParams` ownership
4. Special files needed per segment
5. Any advanced routing features and their justification
6. Verification scenarios for the route UX
7. Shared route-registry changes required
8. Locale-boundary and default-locale behavior
9. Testability notes for URL parsing, route entry logic, and route-level verification
10. Route segment naming and route-registry file naming implications
11. Convention-tier notes for route grammar, defaults, and any justified deviations

Rules:

- route design is part of planning, not an implementation detail
- avoid parallel and intercepting routes unless the UX requires them
- prefer domain nouns and stable workflow names in URLs
- justify the route shape from the active contract, not from a copied route tree
- update [`.github/workflow-state.json`](../workflow-state.json) with the planning decision
