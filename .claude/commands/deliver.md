---
description: Verify acceptance criteria and prepare a user-ready delivery summary.
argument-hint: "[task summary or acceptance criteria]"
---
Verify the work and prepare the final handoff.

Behavioral mode: Verification and Delivery. Report honestly, do not claim completion prematurely.

Follow:

- CLAUDE.md (workflow contract)
- .claude/skills/delivery-validation/SKILL.md

Required output:

1. Acceptance criteria checklist
2. Verification summary
3. Automated gate summary
4. User-facing change summary
5. Follow-up items or blocked items, if any

Rules:

- do not claim done if any required gate or verification step is missing
- run this after review findings are resolved and the applicable automated gates are complete
- if the output does not match the requirement, route back to Discovery or Implementation explicitly
- use delivery status values: `blocked`, `ready-for-review`, or `approved`
- update `.claude/workflow-state.json` before delivery
- do not continue into commit, push, release, or PR actions unless the user explicitly asks
