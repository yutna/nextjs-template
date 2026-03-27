---
name: review-work
description: Review implemented work for correctness, risk, and readiness for verification.
agent: "Reviewer"
argument-hint: "[implementation summary or changed scope]"
---
Review the implemented work before final quality gates and delivery.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [workflow core instructions](../instructions/workflow-core.instructions.md)
- [convention tiering skill](../skills/convention-tiering/SKILL.md)

Required output:

1. Findings ordered by severity
2. Missing tests or validation gaps
3. Convention-tier classification for material findings
4. Rollback or fix recommendation, if needed
5. Whether the task can move to `run-quality-gates` or must return to Implementation

Rules:

- findings come first, with concise evidence
- treat hard-convention drift as blocking by default, strong-default drift as a finding unless justified, and local variation as acceptable unless it causes harm
- do not implement broad fixes in review mode
- if a finding invalidates the current phase, route explicitly back to Implementation or Planning before quality gates continue
