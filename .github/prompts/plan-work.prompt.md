---
name: plan-work
description: Create an implementation plan from clarified requirements.
---
Create a planning deliverable only. Do not implement.

Behavioral mode: Planning only. Do not edit implementation files or create code.

Workflow contract and required skill invocation:

- [AGENTS.md](../../AGENTS.md) (workflow contract)
- Invoke the [convention-tiering skill](../skills/convention-tiering/) first to classify hard
  conventions, strong defaults, and local freedom.
- Then invoke the [implementation-planning skill](../skills/implementation-planning/) to produce the
  executable plan.

Required output:

1. Approach summary
2. Files or areas in scope
3. Dependencies and sequencing
4. Risks and rollback points
5. Validation strategy
6. Convention-tier notes: hard conventions preserved, strong defaults reused, and any justified deviations
7. Approval checkpoint for moving to Implementation

Plans for non-trivial work must also include:

- exact file count in scope
- predicted implementation complexity
- decomposition artifact path when the request is large
- phase in scope when working from `docs/tasks/**`

Rules:

- explore before deciding
- reuse existing architecture and conventions
- classify convention decisions into hard conventions, strong defaults, and local freedom
- keep the plan specific enough that implementation does not need to guess
- do not justify structural choices only because another repository used them before
- if the likely scope exceeds a small batch, require decomposition before approving Implementation
- call out when code-organization rules will force helper/constants/type extraction into dedicated files
- for DB-related plans, explicitly record target env, migration impact, rollback, seed determinism, and test isolation
- use only `plan.status = "not-started" | "proposed" | "approved" | "blocked"`
- update `.claude/workflow-state.json` with planning status and files in scope
- stop after delivering the plan; do not continue into Implementation
