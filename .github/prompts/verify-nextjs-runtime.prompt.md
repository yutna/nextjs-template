---
name: verify-nextjs-runtime
description: Run quality gates and verify Next.js runtime behavior, route UX, and delivery readiness.
agent: "Verifier"
argument-hint: "[feature or route area]"
---
Verify the Next.js implementation and prepare delivery evidence.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [quality gates instructions](../instructions/quality-gates.instructions.md)
- [Next.js runtime debugging skill](../skills/nextjs-runtime-debugging/SKILL.md)
- [Next.js browser QA skill](../skills/nextjs-browser-qa/SKILL.md)
- [Next.js i18n skill](../skills/nextjs-i18n/SKILL.md)
- [Next.js MCP orchestration skill](../skills/nextjs-mcp-orchestration/SKILL.md)
- [Next.js logging skill](../skills/nextjs-logging/SKILL.md)
- [Next.js client exceptions skill](../skills/nextjs-client-exceptions/SKILL.md)
- [Next.js state machines skill](../skills/nextjs-state-machines/SKILL.md)
- [Next.js UI runtime skill](../skills/nextjs-ui-runtime/SKILL.md)
- [Next.js testability skill](../skills/nextjs-testability/SKILL.md)
- [delivery validation skill](../skills/delivery-validation/SKILL.md)

Required output:

1. Commands or checks run
2. Route and runtime verification summary
3. Browser or MCP evidence summary
4. Acceptance criteria checklist
5. Automated gate summary
6. Delivery readiness and any follow-up items
7. `en`/`th` and default-locale verification
8. Any testability debt or automation-shape gaps discovered during verification
9. Logging or library-decision evidence for any client exceptions or UI runtime layers involved

Rules:

- use existing project commands only
- include route-level UX evidence when the task changes navigation or segment behavior
- do not claim done if runtime verification is incomplete
