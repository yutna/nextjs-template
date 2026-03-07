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

Build a complete, production-ready feature from a vague user
idea. This prompt follows the 2-touchpoint model: gather
requirements from the user, then execute everything
autonomously.

## Input

`${input}` is the user's description of what they want. It
may be vague, incomplete, or non-technical.

## Phase 1 — Requirements Gathering (Touchpoint 1)

The user is present. Ask questions until requirements are
clear.

### Steps

1. Read `${input}` and identify the core intent. What
   problem is the user solving?

1. Ask clarifying questions one at a time using `ask_user`.
   Provide choices when possible. Cover these categories in
   order:

   - **Scope** — What is included? What is out of scope?
   - **Behavior** — What does the user see and interact with?
   - **Data** — What data is involved? Where from?
   - **Access** — Public or private (auth-required)?
   - **Edge cases** — Error states, empty states, loading?
   - **Integration** — Connect to existing features?

1. Stop asking when you can write unambiguous user stories.
   Do not ask questions the codebase already answers — check
   AGENTS.md, existing modules, and shared components first.

1. Produce a requirements summary:

   - One paragraph describing the feature
   - User stories (As a [user], I want [X] so that [Y])
   - Acceptance criteria (Given/When/Then)

## Phase 2 — Architecture & Planning

1. Load the `autonomous-workflow` skill for the execution
   protocol.

1. Load the `project-feature-flow` skill for architecture
   guidance.

1. Research the codebase using `explore` agents:

   - Find similar features in `src/modules/`
   - Find reusable code in `src/shared/`
   - Check route structure in `src/app/[locale]/`

1. Create a plan with todos and dependencies following the
   project's build order:

   ```
   1. Route entry (page.tsx)
   2. Screen (composes containers)
   3. Containers (binds logic to presenters)
   4. Components (stateless presenters)
   5. Actions (server actions with next-safe-action)
   6. Schemas (Zod validation)
   7. Lib code (reusable service logic)
   8. Hooks (client logic, only if needed)
   9. i18n messages (en + th)
   10. Route helpers
   11. Tests
   ```

1. Present the plan to the user for approval.

## Phase 3 — Autonomous Execution

After plan approval, the user leaves. Execute everything
autonomously following the `autonomous-workflow` skill
protocol.

### For each todo

1. Set todo status to `in_progress` in SQL
1. Research if needed (spawn `explore` agent)
1. Implement (spawn `general-purpose` agent with full
   context: research findings + AGENTS.md rules + skill
   knowledge)
1. Run quality gates: `npm run check-types && npm run lint && npm run test`
1. Self-heal on failure (max 3 retries per todo)
1. Code review (spawn `code-review` agent)
1. Fix any review issues, rerun gates
1. Mark todo as `done` in SQL
1. Continue to next ready todo

### Parallel execution

Launch independent todos simultaneously using background
agents. Dependent todos wait until prerequisites are done.

## Phase 4 — Delivery (Touchpoint 2)

Present the completed feature to the user.

Include:

1. **What was built** — files created, module structure
2. **Quality status** — 0 type errors, 0 lint errors,
   0 warnings, all tests passing
3. **How to use it** — route path, how to navigate there

### Definition of Done

All of these must be true before presenting to the user:

- Feature works end-to-end exactly as requirements describe
- Zero bugs — every code path tested and verified
- Zero type errors on all touched files
- Zero lint errors on all touched files
- Zero warnings on all touched files
- All existing tests still pass (no regressions)
- New tests cover the new feature
- Code review passed — no security or convention issues
- Production-ready — human has nothing to fix

If any criterion is not met, keep working. Never present
incomplete work.
