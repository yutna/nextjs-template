---
name: audit-nextjs-file-system
description: Review a Next.js code area for folder-structure drift, file-naming inconsistency, and module-placement violations.
agent: "Reviewer"
argument-hint: "[feature, route area, or changed scope]"
---
Audit the Next.js file system structure only. Do not implement.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [Next.js feature module skill](../skills/nextjs-feature-module/SKILL.md)
- [Next.js file-system governance skill](../skills/nextjs-file-system-governance/SKILL.md)
- [Next.js route registry skill](../skills/nextjs-route-registry/SKILL.md)

Required output:

1. Findings ordered by severity
2. Folder-structure drift or naming violations
3. Generic files or accidental shared-surface leaks
4. Recommended renames, moves, or cleanup scope
5. Whether the task can proceed or should return to Planning or Implementation

Rules:

- findings come first
- prioritize deterministic consistency over personal naming preference
- treat vague file names and one-off folders as maintainability findings, not style trivia
