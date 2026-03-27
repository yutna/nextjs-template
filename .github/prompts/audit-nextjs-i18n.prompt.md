---
name: audit-nextjs-i18n
description: Audit a Next.js implementation for locale coverage, hardcoded user-facing text, message parity, and default-locale behavior.
agent: "Reviewer"
argument-hint: "[feature or changed scope]"
---
Run a focused i18n review before final delivery.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [Next.js i18n skill](../skills/nextjs-i18n/SKILL.md)
- [Next.js routing skill](../skills/nextjs-routing/SKILL.md)

Required output:

1. Findings ordered by severity
2. Hardcoded-text or missing-translation issues
3. `next-intl` integration or locale-resolution issues
4. Locale coverage for `en` and `th`
5. Locale-prefixed route behavior findings such as `/en` and `/th`
6. Default-locale behavior findings
7. Required rollback or fix recommendation

Rules:

- findings come first
- prioritize hardcoded UI text, missing `th` coverage, broken `next-intl` integration, and incorrect default-locale handling
- do not implement broad fixes in review mode
