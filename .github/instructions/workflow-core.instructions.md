---
name: Workflow Core
description: Core workflow ordering and rollback rules for all tasks.
applyTo: "**"
---
# Workflow core

Apply the canonical workflow from [AGENTS.md](../../AGENTS.md).

Before taking action:

1. identify the current phase
2. check [`.github/workflow-state.json`](../workflow-state.json)
3. confirm the preconditions for the next step

Rules:

- if requirements are not clear enough to change behavior safely, stay in Discovery and ask questions
- if the work is non-trivial and the plan is missing or unapproved, stay in Planning
- if new information invalidates completed work, roll back to the earliest required phase
- if the user rejects the plan, go back to Planning
- if the user rejects the result, go back to Discovery or Implementation based on the feedback

When completing a phase, update the workflow state so the next tool, prompt, or agent can continue without guessing.
