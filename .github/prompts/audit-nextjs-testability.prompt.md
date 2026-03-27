---
name: audit-nextjs-testability
description: Review a Next.js feature for testability, automation coverage quality, and hard-to-exercise code shape.
agent: "Reviewer"
argument-hint: "[feature, module, or changed scope]"
---
Audit the Next.js implementation for testability only. Do not implement.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [Next.js testability skill](../skills/nextjs-testability/SKILL.md)
- [Next.js feature module skill](../skills/nextjs-feature-module/SKILL.md)
- [Next.js client boundary skill](../skills/nextjs-client-boundary/SKILL.md)
- [Next.js Server Actions skill](../skills/nextjs-server-actions/SKILL.md)

Required output:

1. Findings ordered by severity
2. Hard-to-test code-shape risks
3. Missing or weak automated coverage caused by boundary placement
4. Recommended seam extractions or fixture improvements
5. Whether the task can proceed or should return to Planning or Implementation

Rules:

- findings come first
- prioritize avoidable framework coupling, hidden side effects, and logic trapped in route shells or wide client components
- distinguish between acceptable scope limits and design debt that should be fixed now
