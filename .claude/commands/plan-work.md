---
description: Create an implementation plan from clarified requirements.
argument-hint: "[approved requirements or feature summary]"
---
Create a planning deliverable only. Do not implement.

Behavioral mode: Planning only. Do not edit implementation files or create code.

Follow:

- CLAUDE.md (workflow contract)
- .claude/skills/convention-tiering/SKILL.md
- .claude/skills/implementation-planning/SKILL.md

Required output:

1. Approach summary
2. Files or areas in scope
3. Dependencies and sequencing
4. Risks and rollback points
5. Validation strategy
6. Convention-tier notes: hard conventions preserved, strong defaults reused, and any justified deviations
7. Approval checkpoint for moving to Implementation

Rules:

- explore before deciding
- reuse existing architecture and conventions
- classify convention decisions into hard conventions, strong defaults, and local freedom
- keep the plan specific enough that implementation does not need to guess
- do not justify structural choices only because another repository used them before
- use only `plan.status = "not-started" | "proposed" | "approved" | "blocked"`
- update `.claude/workflow-state.json` with planning status and files in scope
- stop after delivering the plan; do not continue into Implementation
