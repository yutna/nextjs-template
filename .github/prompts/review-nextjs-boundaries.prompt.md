---
name: review-nextjs-boundaries
description: Review a Next.js implementation for server-client boundaries, module placement, and consistency.
agent: "Reviewer"
argument-hint: "[changed scope or feature summary]"
---
Review the Next.js implementation before final verification.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [Convention tiering skill](../skills/convention-tiering/SKILL.md)
- [Next.js feature module skill](../skills/nextjs-feature-module/SKILL.md)
- [Next.js client boundary skill](../skills/nextjs-client-boundary/SKILL.md)
- [Next.js file-system governance skill](../skills/nextjs-file-system-governance/SKILL.md)
- [Next.js client exceptions skill](../skills/nextjs-client-exceptions/SKILL.md)
- [Next.js state machines skill](../skills/nextjs-state-machines/SKILL.md)
- [Next.js UI runtime skill](../skills/nextjs-ui-runtime/SKILL.md)
- [Next.js testability skill](../skills/nextjs-testability/SKILL.md)
- [Next.js Zag.js skill](../skills/nextjs-zag-js/SKILL.md)

Required output:

1. Findings ordered by severity
2. Boundary and placement issues
3. File-system or naming issues
4. Missing tests or validation gaps
5. Convention-tier classification for material findings
6. Whether the task can proceed or must return to Implementation

Rules:

- findings come first
- prioritize misplaced `"use client"`, module sprawl, server/client leaks, hard-to-test code shape, unnecessary SWR or XState usage, and ad hoc primitive state where Chakra/Ark/Zag would be the correct layer
- use the convention tiers to separate blocking grammar drift from acceptable local implementation variation
- do not implement broad fixes in review mode
