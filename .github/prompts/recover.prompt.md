---
name: recover
description: Diagnose a failure, choose the rollback phase, and recover without random fixes.
---
Recover from a failure deliberately.

Behavioral mode: Recovery. Diagnose before fixing. Roll back to the earliest valid phase.

Workflow contract and required skill invocation:

- [AGENTS.md](../../AGENTS.md) (workflow contract)
- Invoke the [error-recovery skill](../skills/error-recovery/) first before choosing fixes or
  rollback phase.

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
