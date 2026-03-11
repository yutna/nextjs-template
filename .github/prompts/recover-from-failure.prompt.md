---
name: recover-from-failure
description: Diagnose a failure, choose the rollback phase, and recover without random fixes.
agent: "Orchestrator"
argument-hint: "[failure output or symptom]"
---
Recover from a failure deliberately.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [workflow core instructions](../instructions/workflow-core.instructions.md)
- [error recovery skill](../skills/error-recovery/SKILL.md)

Required output:

1. Failure classification
2. Root cause hypothesis tied to evidence
3. Rollback phase
4. Fix plan
5. Retry count and blocked-state recommendation if needed

Rules:

- do not patch blindly
- rerun downstream gates after the fix
- record the retry state in [`.github/workflow-state.json`](../workflow-state.json)
