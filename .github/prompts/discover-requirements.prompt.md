---
name: discover-requirements
description: Clarify a vague request into scope, constraints, and acceptance criteria.
agent: "Requirements Analyst"
argument-hint: "[problem statement or feature idea]"
---
Turn the request into a Discovery deliverable without planning or implementing.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [workflow core instructions](../instructions/workflow-core.instructions.md)
- [requirements clarification skill](../skills/requirements-clarification/SKILL.md)

Required output:

1. Problem statement
2. Scope and out-of-scope items
3. Constraints and assumptions
4. Acceptance criteria
5. Open questions, if any
6. Recommendation for whether the task can move to Planning

Rules:

- ask questions when ambiguity changes behavior, scope, data, UX, or architecture
- do not produce an implementation plan yet
- update [`.github/workflow-state.json`](../workflow-state.json) to reflect the discovery outcome
