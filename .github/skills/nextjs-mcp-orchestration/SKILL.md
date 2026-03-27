---
name: nextjs-mcp-orchestration
description: Use MCP as a structured evidence layer for Next.js design, runtime debugging, and verification. Use this when a task depends on Figma, runtime inspection, or design-system context.
---

# Next.js MCP Orchestration

Use this skill when Next.js work depends on external design or runtime evidence.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [Next.js enterprise design](../../../docs/nextjs-enterprise-workflow-design.md)
- [Next.js MCP playbook](../../../docs/nextjs-enterprise-mcp-playbook.md)

## Source priority

1. repository-local workflow rules and architecture
2. design truth from Figma MCP
3. runtime truth from Next DevTools MCP or browser evidence
4. optional design-system MCP documentation

## When to use

- a request starts from a design file, frame, or screenshot
- route or layout behavior needs runtime inspection
- reviewers need evidence for visual parity or cache behavior
- a migration plan depends on current runtime or design-system context

## Workflow

1. Identify which MCP server is relevant.
2. Capture the smallest useful evidence set:
   - design frame or component mapping
   - runtime route or mutation behavior
   - component API or design-system guidance
3. Translate that evidence into workflow artifacts:
   - requirements
   - acceptance criteria
   - route and module design
   - verification checklist
4. Keep local repository conventions authoritative.
5. Record fallbacks if MCP is unavailable.

## Output checklist

- MCP servers consulted
- exact design frame, route, or runtime surface inspected
- decisions that came from MCP evidence
- remaining assumptions
- follow-up work such as missing Code Connect mappings or missing runtime instrumentation

## Do not

- let MCP decide architecture without the local workflow contract
- skip planning because the design looks clear
- treat MCP availability as mandatory for all Next.js work
