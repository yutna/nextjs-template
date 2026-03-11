---
name: verify-and-deliver
description: Verify acceptance criteria and prepare a user-ready delivery summary.
agent: "Orchestrator"
argument-hint: "[task summary or acceptance criteria]"
---
Verify the work and prepare the final handoff.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [quality gates instructions](../instructions/quality-gates.instructions.md)
- [delivery validation skill](../skills/delivery-validation/SKILL.md)

Required output:

1. Acceptance criteria checklist
2. Verification summary
3. Automated gate summary
4. User-facing change summary
5. Follow-up items or blocked items, if any

Rules:

- do not claim done if any required gate or verification step is missing
- if the output does not match the requirement, route back to Discovery or Implementation explicitly
- update [`.github/workflow-state.json`](../workflow-state.json) before delivery
