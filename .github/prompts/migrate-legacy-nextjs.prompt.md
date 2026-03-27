---
name: migrate-legacy-nextjs
description: Inventory a legacy Next.js application and produce a phased migration backlog into the enterprise profile.
agent: "Migrator"
argument-hint: "[legacy repo area or migration goal]"
---
Produce a migration inventory and plan only. Do not implement.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [workflow core instructions](../instructions/workflow-core.instructions.md)
- [Next.js migration skill](../skills/nextjs-migration/SKILL.md)
- [Next.js file-system governance skill](../skills/nextjs-file-system-governance/SKILL.md)
- [Next.js i18n skill](../skills/nextjs-i18n/SKILL.md)
- [Next.js MCP orchestration skill](../skills/nextjs-mcp-orchestration/SKILL.md)
- [Next.js client exceptions skill](../skills/nextjs-client-exceptions/SKILL.md)
- [Next.js state machines skill](../skills/nextjs-state-machines/SKILL.md)
- [Next.js functional patterns skill](../skills/nextjs-functional-patterns/SKILL.md)
- [Next.js testability skill](../skills/nextjs-testability/SKILL.md)

Required output:

1. Legacy surface inventory
2. Target route and module mapping
3. Codemod-safe work vs manual rewrites
4. Migration sequence and rollback points
5. Parity verification plan
6. Approval checkpoint before implementation
7. Migration tracker artifact updates
8. Locale-routing and translation migration notes
9. Testability debt and target automation seams after migration
10. Canonical slug, folder-shape, and rename backlog
11. Legacy library migration notes for env, logging, client exceptions, machines, and UI runtime

Rules:

- keep migration work in Discovery and Planning until the inventory is explicit
- treat Pages Router, custom server logic, and client-heavy surfaces as first-class migration risks
- update [`.github/workflow-state.json`](../workflow-state.json) with migration planning outcomes
