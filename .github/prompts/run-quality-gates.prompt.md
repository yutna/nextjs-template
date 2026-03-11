---
name: run-quality-gates
description: Run all existing project quality gates in the canonical order.
agent: "Verifier"
argument-hint: "[optional scope or changed files]"
---
Run every applicable gate and report the results honestly.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [quality gates instructions](../instructions/quality-gates.instructions.md)
- [quality gates skill](../skills/quality-gates/SKILL.md)

Required output:

1. Commands or checks that were run
2. Pass, fail, or not-applicable status for each gate
3. Root cause summary for any failure
4. Whether the task can move to Verification or must return to Implementation

Rules:

- use only the checks that already exist in the repository
- if any gate fails, do not deliver and do not skip ahead
- update [`.github/workflow-state.json`](../workflow-state.json) with the gate results
