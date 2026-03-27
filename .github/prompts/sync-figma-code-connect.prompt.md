---
name: sync-figma-code-connect
description: Audit Figma Code Connect coverage and identify missing component mappings or MCP instructions for a Next.js codebase.
agent: "Planner"
argument-hint: "[design system area or feature family]"
---
Audit Figma Code Connect readiness for the Next.js enterprise workflow.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [Next.js MCP orchestration skill](../skills/nextjs-mcp-orchestration/SKILL.md)
- [Next.js feature module skill](../skills/nextjs-feature-module/SKILL.md)
- [Next.js file-system governance skill](../skills/nextjs-file-system-governance/SKILL.md)

Required output:

1. Connected components confirmed
2. Missing mappings or missing MCP instructions
3. Recommended code paths or components to connect
4. Follow-up backlog ordered by impact
5. File-system targets or naming cleanup required for stable Code Connect adoption
