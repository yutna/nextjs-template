---
name: check-repo-readiness
description: Run repo-specific readiness checks after the canonical gates when coverage, build, or Storybook confidence matters.
agent: "Verifier"
argument-hint: "[changed surfaces or release scope]"
---
Check whether the task is ready for verification or delivery at the repository level.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [quality gates instructions](../instructions/quality-gates.instructions.md)
- [quality gates skill](../skills/quality-gates/SKILL.md)
- [repo readiness skill](../skills/repo-readiness/SKILL.md)

Required output:

1. Canonical gate status summary
2. Additional readiness checks run
3. `passed`, `failed`, or `not-applicable` status for each additional check
4. Root cause summary for any failure
5. Whether the task is ready to continue or must return to Implementation

Rules:

- do not redefine the canonical gate order
- mark extra checks `not-applicable` when the task scope does not warrant them
- report any failed readiness check honestly
- update [`.github/workflow-state.json`](../workflow-state.json) with the latest readiness signal before delivery
