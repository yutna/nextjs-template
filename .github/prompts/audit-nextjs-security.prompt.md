---
name: audit-nextjs-security
description: Audit a Next.js implementation for Server Action safety, auth boundaries, env handling, and HTTP exposure.
agent: "Reviewer"
argument-hint: "[feature or changed files]"
---
Run a focused security review before final delivery.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [Next.js security review skill](../skills/nextjs-security-review/SKILL.md)

Required output:

1. Findings ordered by severity
2. Unsafe mutations or auth gaps
3. Env, DTO, or exposure issues
4. Required rollback or fix recommendation

Rules:

- findings come first
- prioritize auth, data exposure, and unsafe mutation surfaces
- do not paper over security risk with style feedback
