---
name: implementation-planning
description: This skill should be used when the user asks to "create a plan", "plan implementation", or after requirements are clarified and before implementation starts. Creates a concrete implementation plan with sequencing, dependencies, risks, and validation strategy.
---

# Implementation Planning

Use this skill during Planning.

Reference:

- CLAUDE.md (workflow contract)
- .claude/workflow-state.json

## Goals

- translate approved requirements into an executable plan
- identify files, ownership boundaries, and dependencies
- define validation before code changes begin

## Process

1. Review clarified requirements and constraints.
2. Explore existing patterns and reusable surfaces.
3. Decide where each change belongs.
4. Classify the decision surfaces:
   - hard conventions to preserve
   - strong defaults to reuse
   - any justified deviations
5. Break the work into ordered steps with explicit dependencies.
6. Define the validation path:
   - tests to add or update
   - existing quality commands to run
   - verification needed after automation
7. Update workflow state:
   - `phase = "planning"`
   - `plan.status = "proposed"` or `"approved"`
   - `plan.filesInScope = [...]`

## Output checklist

- approach summary
- files or modules in scope
- dependencies
- risk areas
- rollback points
- validation strategy
- convention-tier notes

## Do not

- implement code
- leave ownership boundaries implicit
- skip an approval checkpoint for non-trivial work
- justify structure only by copying a familiar example instead of using the repository contract
