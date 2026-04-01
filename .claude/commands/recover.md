---
description: Diagnose a failure, choose the rollback phase, and recover without random fixes.
argument-hint: "[failure output or symptom]"
---
Recover from a failure deliberately.

Behavioral mode: Recovery. Diagnose before fixing. Roll back to the earliest valid phase.

Follow:

- CLAUDE.md (workflow contract)
- .claude/skills/error-recovery/SKILL.md

Required output:

1. Failure classification
2. Root cause hypothesis tied to evidence
3. Rollback phase
4. Fix plan
5. Retry count and blocked-state recommendation if needed

Rules:

- do not patch blindly
- rerun downstream gates after the fix
- record the retry state in `.claude/workflow-state.json`
- if the retry budget is exhausted (3 attempts), mark the work item as blocked with evidence
