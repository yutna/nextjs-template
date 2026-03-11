---
name: implement-approved-plan
description: Execute an approved plan without expanding scope.
agent: "Implementer"
argument-hint: "[approved plan summary]"
---
Implement the approved work and stay inside the agreed scope.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [quality gate instructions](../instructions/quality-gates.instructions.md)
- [state sync skill](../skills/state-sync/SKILL.md)

Required output:

1. What was implemented
2. Files changed
3. Tests added or updated
4. Any newly discovered risks or blockers
5. Recommended next validation step

Rules:

- do not change architecture or conventions without a recorded reason
- if the plan becomes invalid, stop and return to Planning
- keep [`.github/workflow-state.json`](../workflow-state.json) current while implementing
