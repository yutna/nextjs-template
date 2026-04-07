# Workflow SOP (One Page)

Status: Active
Scope: Claude Code and GitHub Copilot (CLI + Chat) workflows
Last Updated: 2026-04-06

## Purpose

This SOP defines the default execution path for feature delivery so all supported AI
surfaces behave consistently with minimal manual intervention.

## Scope

Use this SOP for implementation work in this repository.

Out of scope:

- Product decomposition document authoring details
- Runtime state internals
- Tool-specific UI usage tutorials

## Non-Overlap Rule with Decompose

Use `decompose-requirements` only when starting a new scope that is clearly larger
than one approved implementation slice.

Do not run decomposition again for normal defect fixes or iterative corrections after
implementation begins unless the task scope changes materially.

- `decompose-requirements` = requirement decomposition artifact creation
- Workflow phases below = execution discipline for delivering decomposed work
- Typical trigger: work that obviously spans multiple workflow phases or more than
  roughly 12 files/folders

## Fresh-Task Bootstrap

If you are starting a brand-new task and need to clear stale workflow state first,
run `./bin/vibe task workflow:bootstrap` once. Then begin Discovery using the surface
that matches your tool:

- **Claude Code / Copilot Chat**: `/discover`
- **Copilot CLI**: a plain-language discovery request, or `/plan` if the requirements
  are already clear enough for planning

## Required Inputs

1. Approved or sufficiently clarified requirements
2. Active task scope (feature slice or defect slice)
3. Current repository conventions from `AGENTS.md`
4. A small approved implementation batch, not an open-ended multi-phase scope

## Default Execution Flow

1. Discovery
2. Planning
3. Implementation
4. Quality Gates (type check -> lint -> tests)
5. Verification
6. Delivery

If any gate fails, return to Implementation, fix root cause, and rerun all gates from type check.

Approved plans should usually cover a small slice, roughly 12 or fewer non-governance files or folders. If the work is clearly larger or multi-phase, decompose once and execute one approved phase at a time.

## Commands, Prompts, and Built-ins

Use the workflow surface that matches the tool context. Claude Code can enforce the
workflow through hooks and the shared state file. Copilot Chat follows the same
contract through repo prompt files inside chat. Copilot CLI follows the same contract
through built-ins plus plain-language requests; it does not expose the repo prompt
files as native slash commands.

### Claude Code and Copilot Chat workflow surfaces

- `/discover`
- `/plan-work`
- `/implement`
- `/review`
- `/gates`
- `/deliver`
- `/recover`

### Copilot CLI built-ins that pair with the workflow

- `/plan`
- `/research`
- `/review`
- `/agent`
- `/skills`
- `/instructions`
- `/mcp`

In Copilot CLI, Discovery, Implementation, Quality Gates, Verification, Delivery, and
Recovery still use plain-language requests around those built-ins.

Core quality and parity checks:

- `npm run check-types`
- `npm run lint`
- `npm run test`
- `npm run sync:copilot:check`
- `npm run parity:all`
- `./bin/vibe task workflow:audit`
- `npm run workflow:state:validate`

`npm run lint` is part of workflow enforcement, not just style hygiene. It includes staged custom convention rules on the template's currently enforced surfaces.

## State Hygiene

- Update `.claude/workflow-state.json` through the workflow API instead of ad hoc shell writes
- Changing `taskId` starts a new task and should reset stale plan, implementation, and gate context
- If implementation reaches files outside `plan.filesInScope`, stop and return to Planning before continuing

## Definition of Done

Work is done only when all are true:

- Acceptance criteria are satisfied
- Type check passes
- Lint passes with zero warnings/errors, including staged custom convention rules on currently enforced surfaces
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

## Fast Operating Cadence

For speed during active coding:

1. Run `npm run qa:fast` before each handoff checkpoint

For stable delivery readiness:

1. Run `npm run qa:stable` before opening/updating PR
2. Run `npm run qa:repo` before final merge readiness confirmation
