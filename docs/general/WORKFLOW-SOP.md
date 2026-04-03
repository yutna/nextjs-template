# Workflow SOP (One Page)

Status: Active
Scope: Claude CLI and GitHub Copilot workflows
Last Updated: 2026-04-04

## Purpose

This SOP defines the default execution path for feature delivery so both tools behave consistently with minimal manual intervention.

## Scope

Use this SOP for implementation work in this repository.

Out of scope:

- Product decomposition document authoring details
- Runtime state internals
- Tool-specific UI usage tutorials

## Non-Overlap Rule with Decompose

Use `decompose-requirements` only when starting a new large feature scope.

Do not run decomposition again for normal defect fixes or iterative corrections after implementation begins.

- `decompose-requirements` = requirement decomposition artifact creation
- Workflow phases below = execution discipline for delivering decomposed work

## Required Inputs

1. Approved or sufficiently clarified requirements
2. Active task scope (feature slice or defect slice)
3. Current repository conventions from `AGENTS.md`

## Default Execution Flow

1. Discovery
2. Planning
3. Implementation
4. Quality Gates (type check -> lint -> tests)
5. Verification
6. Delivery

If any gate fails, return to Implementation, fix root cause, and rerun all gates from type check.

## Commands and Prompts

Use either workflow prompts or CLI tasks depending on the tool context.

Core workflow prompts:

- `/discover`
- `/plan-work`
- `/implement`
- `/review`
- `/gates`
- `/deliver`
- `/recover`

Core quality and parity checks:

- `npm run check-types`
- `npm run lint`
- `npm run test`
- `npm run sync:copilot:check`
- `./bin/vibe parity-check --all`
- `./bin/vibe task workflow:audit`

## Definition of Done

Work is done only when all are true:

- Acceptance criteria are satisfied
- Type check passes
- Lint passes with zero warnings/errors
- Tests pass
- Verification is complete
- Relevant parity checks pass for workflow assets

## Escalation Rules

Escalate only when one of these is true:

1. Retry budget for the same issue is exhausted
2. Requirement ambiguity blocks safe implementation
3. External dependency/environment issue blocks progress

## Ownership

- Users trigger decomposition for new large scopes
- Tools execute workflow phases and quality gates
- CI enforces parity and baseline quality

## Quick Start

1. Large new feature: run decomposition once
2. Execute workflow phases for each slice
3. Fix defects directly in workflow without re-decomposition
4. Run parity and audit checks before final delivery
