---
description: Run all existing project quality gates in the canonical order.
argument-hint: "[optional scope or changed files]"
---
Run every applicable gate and report the results honestly.

Behavioral mode: Quality Gates. Run checks, report honestly, do not hide failures.

Follow:

- CLAUDE.md (workflow contract)
- .claude/skills/quality-gates/SKILL.md

Required output:

1. Commands or checks that were run
2. Pass, fail, or not-applicable status for each gate
3. Root cause summary for any failure
4. Whether the task can move to Verification or must return to Implementation

Rules:

- run gates in canonical order: type check, lint, tests
- use only the checks that already exist in the repository
- run this after review findings are resolved or when the work does not need a separate review pass
- if any gate fails, do not deliver and do not skip ahead
- if a gate does not exist, mark it `not-applicable` with a reason
- if automation is weak because the code shape is hard to test, report that as a design issue
- update `.claude/workflow-state.json` with the gate results
