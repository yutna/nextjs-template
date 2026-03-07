---
name: build-feature
description: >-
  Build a complete feature autonomously from a vague idea.
  Gathers requirements, plans, then executes with zero human
  interaction until delivery.
agent: agent
tools: ['agent', 'edit/editFiles', 'search/codebase']
argument-hint: '[description of what you want] e.g. user profile page with avatar upload'
---

# Build Feature — Autonomous Workflow

Load the `autonomous-workflow` skill for the full execution protocol.
Load the `project-feature-flow` skill for architecture guidance.

## Input

`${input}` is the user's description of what they want. It may be vague,
incomplete, or non-technical.

## Execution

Follow the 2-touchpoint model from the autonomous-workflow skill:

1. **Touchpoint 1** — Gather requirements from the user using `ask_user`.
   Ask one question at a time with choices. Stop when user stories are clear.
2. **Plan** — Research codebase with `explore` agents, create todos following
   the build order in AGENTS.md, present plan for approval.
3. **Execute** — After approval, implement autonomously. Spawn sub-agents,
   run quality gates, self-heal on failure, code review each todo.
4. **Touchpoint 2** — Present completed feature. Every item in the Definition
   of Done (AGENTS.md) must be met before presenting.
