---
name: Next.js MCP
description: Use MCP as a source of design and runtime evidence for Next.js work without replacing the local workflow contract.
applyTo: "apps/web/src/**/*.{ts,tsx},src/**/*.{ts,tsx},.vscode/mcp.json,.github/prompts/**/*,.github/agents/**/*,docs/**/*.md"
---
# Next.js MCP

Treat MCP as an evidence layer, not an architecture replacement.

Rules:

- use Figma MCP for design-driven route, layout, and component decisions when design artifacts exist
- use Next DevTools MCP for runtime, route, cache, and Server Action debugging when a dev server is available
- convert MCP findings into explicit acceptance criteria, route decisions, or verification notes
- prefer Code Connect mappings when the design system is connected; mapped components beat guessed ones
- keep local repository conventions authoritative when MCP suggestions conflict with the profile

Do not:

- invent layout or component usage if MCP already provides the answer
- treat MCP output as permission to bypass planning, route review, or verification
- block a task just because MCP is unavailable; fall back to local docs and runtime evidence
