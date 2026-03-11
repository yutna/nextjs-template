---
name: verify-rendered-ui
description: Verify visible app changes in a real browser using the repo's rendered UI verification workflow.
agent: "Verifier"
argument-hint: "[route list or change summary]"
---
Verify rendered output before delivery.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [quality gates instructions](../instructions/quality-gates.instructions.md)
- [local runtime bootstrap skill](../skills/local-runtime-bootstrap/SKILL.md)
- [rendered UI verification skill](../skills/rendered-ui-verification/SKILL.md)

Required output:

1. Surfaces or routes verified
2. Preconditions status
3. `PASS`, `FAIL`, or `PARTIAL` result for each verified surface
4. Issues, evidence, and likely next action
5. Whether the task can stay in Verification or must return to Implementation

Rules:

- use real browser verification for rendered changes
- Storybook may assist visual iteration, but it does not replace runtime verification
- if browser verification is not applicable, say why explicitly
- update [`.github/workflow-state.json`](../workflow-state.json) before delivery
