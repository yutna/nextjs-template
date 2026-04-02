---
description: Review implemented work for correctness, risk, and readiness for verification.
argument-hint: "[implementation summary or changed scope]"
---
Review the implemented work before final quality gates and delivery.

Behavioral mode: Review only. Do not edit implementation files. Findings only.

Follow:

- CLAUDE.md (workflow contract)
- .claude/skills/convention-tiering/SKILL.md

Required output:

1. Findings ordered by severity
2. Missing tests or validation gaps
3. Convention-tier classification for material findings
4. Rollback or fix recommendation, if needed
5. Whether the task can move to `/gates` or must return to Implementation

Rules:

- findings come first, with concise evidence
- treat hard-convention drift as blocking by default, strong-default drift as a finding unless justified, and local variation as acceptable unless it causes harm
- do not implement broad fixes in review mode
- do not edit implementation or workflow files in review mode
- if a finding invalidates the current phase, route explicitly back to Implementation or Planning
- stop after returning review findings; do not continue into quality gates or delivery
