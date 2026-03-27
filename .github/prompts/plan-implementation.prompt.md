---
name: plan-implementation
description: Create an implementation plan from clarified requirements.
agent: "Planner"
argument-hint: "[approved requirements or feature summary]"
---
Create a planning deliverable only. Do not implement.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [workflow core instructions](../instructions/workflow-core.instructions.md)
- [convention tiering skill](../skills/convention-tiering/SKILL.md)
- [implementation planning skill](../skills/implementation-planning/SKILL.md)

Required output:

1. Approach summary
2. Files or areas in scope
3. Dependencies and sequencing
4. Risks and rollback points
5. Validation strategy
6. Convention-tier notes: hard conventions preserved, strong defaults reused, and any justified deviations
7. Approval checkpoint for moving to Implementation

Rules:

- reuse existing architecture and conventions
- keep the plan specific enough that implementation does not need to guess
- do not justify structural choices only because another repository used them before
- update [`.github/workflow-state.json`](../workflow-state.json) with planning status and files in scope
