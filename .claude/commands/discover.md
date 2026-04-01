---
description: Clarify a vague request into scope, constraints, and acceptance criteria.
argument-hint: "[problem statement or feature idea]"
---
Turn the request into a Discovery deliverable without planning or implementing.

Use this as the default entrypoint for a fresh repository or any reset bootstrap state.

Behavioral mode: Discovery only. Do not produce implementation plans or code. Do not create implementation files.

Follow:

- CLAUDE.md (workflow contract)
- .claude/skills/requirements-clarification/SKILL.md

Required output:

1. Problem statement
2. Scope and out-of-scope items
3. Constraints and assumptions
4. Acceptance criteria
5. Open questions, if any
6. Recommendation for whether the task can move to Planning

Rules:

- use this command first when the workflow state is empty, missing, or intentionally reset
- ask questions when ambiguity changes behavior, scope, data, UX, or architecture
- do not produce an implementation plan yet
- keep `phase = "discovery"`; signal readiness with `requirements.status`, not pseudo-phase labels
- use only `requirements.status = "needs-clarification" | "clarified" | "approved"`
- prefer the workflow state API when command execution is available; use a direct state-file edit only as a fallback
- update `.claude/workflow-state.json` to reflect the discovery outcome
- stop after delivering the discovery result; do not continue into Planning or Implementation
