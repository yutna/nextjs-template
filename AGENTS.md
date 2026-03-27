# AI Workflow Contract

This repository defines a GitHub Copilot-first, workflow-first operating standard for AI agents.

Optimize for:

1. Workflow adherence
2. Correctness
3. Consistency
4. Error recovery
5. State awareness
6. Minimal rework
7. User satisfaction
8. Token efficiency

## Order of precedence

Apply instructions in this order:

1. Direct user instruction
2. `AGENTS.md`
3. `.github/copilot-instructions.md`
4. Matching `.github/instructions/*.instructions.md`
5. Relevant prompts, skills, and custom agents
6. Hooks and deterministic policy checks

If sources conflict, follow the highest-priority source and keep the conflict explicit.

## Canonical workflow

Every non-trivial task follows these phases:

1. Discovery
2. Planning
3. Implementation
4. Quality Gates
5. Verification
6. Delivery

The workflow is a loop, not a line. Agents must roll back to the earliest required phase when new information invalidates later work.

## Phase rules

### 1. Discovery

Goals:

- clarify the real problem
- define scope and out-of-scope items
- capture constraints, assumptions, and risks
- write acceptance criteria that can be verified later

Do not:

- create an implementation plan while behavior-changing ambiguity remains
- implement code before requirements are clear
- claim understanding without surfacing unresolved questions

Exit criteria:

- requirements are clarified or explicitly approved as sufficient
- open questions are either resolved or intentionally deferred
- acceptance criteria exist

Rollback trigger:

- if the user says "not what I meant" or ambiguity affects behavior, go back here

### 2. Planning

Goals:

- explore existing patterns and reusable surfaces
- decide where the work belongs
- document the approach, dependencies, risks, and files in scope
- define the validation path before implementation starts
- choose seams and module boundaries that keep changed behavior easy to test

Do not:

- edit implementation files before a plan exists for non-trivial work
- change architecture or conventions without justification
- skip approval when the task needs a plan
- choose a design that forces simple behavior to be verified only through the full app runtime when a smaller seam is practical

Exit criteria:

- plan is explicit
- files and ownership boundaries are clear
- dependencies are identified
- the next implementation step is unambiguous

Rollback trigger:

- if the plan is rejected or a major architectural assumption changes, return here

### 3. Implementation

Goals:

- implement only the approved scope
- preserve established patterns, style, naming, and architecture
- add or update tests for changed behavior
- keep changed behavior behind seams that remain practical to exercise in automated tests
- keep the state record current

Do not:

- expand scope without an explicit reason
- rewrite unrelated areas
- "fix forward" with random edits that are not tied to a root cause

Exit criteria:

- code changes are complete for the approved scope
- impacted behavior has corresponding tests where the project supports tests
- touched files are recorded in state

Rollback trigger:

- if a requirement changes materially, return to Discovery or Planning

### 4. Quality Gates

Run every applicable automated gate in order:

1. Type check
2. Lint
3. Tests

Rules:

- use existing project commands only
- if a gate is not available, record `not-applicable` with a reason
- if any gate fails, fix the root cause and rerun the full gate sequence from the start
- never treat partial success as release-ready

Exit criteria:

- all applicable automated gates are green

Rollback trigger:

- if fixes require design changes, return to Implementation or Planning

### 5. Verification

Goals:

- confirm behavior matches acceptance criteria
- confirm review findings are resolved before final delivery
- review the UX and runtime flow
- perform a self-review for correctness, safety, and convention compliance

Do not:

- deliver based on automated checks alone when runtime or UX verification is still required
- ignore edge cases found during self-review

Exit criteria:

- acceptance criteria are satisfied
- self-review is clean or findings are fixed
- review findings are fixed or intentionally resolved

Rollback trigger:

- runtime bug -> Implementation
- convention or correctness issue -> Quality Gates after the fix

### 6. Delivery

Goals:

- summarize what changed and why
- report gate results honestly
- state any remaining follow-up items explicitly

Do not:

- claim completion before gates and verification pass
- hide uncertainty, missing validation, or blocked items

Exit criteria:

- user can review a clear, honest handoff
- if the user approves, the task is done

Rollback trigger:

- "close but needs tweaks" -> Implementation
- "not what I meant" -> Discovery

## Non-negotiable rules

- No implementation before clarified requirements.
- No non-trivial code changes before a plan exists.
- No delivery before applicable gates and verification pass.
- No silent architecture, convention, or style changes.
- Ask instead of assuming when ambiguity changes scope, data, UX, or behavior.
- No avoidable code shape that makes changed behavior unnecessarily hard to test.
- Prefer minimal, surgical edits over wide refactors.
- Preserve behavior outside the approved scope.

## Definition of done

Work is done only when all applicable conditions are true:

- the requested behavior works end-to-end
- acceptance criteria are satisfied
- existing tests still pass
- new or changed behavior is covered appropriately
- the code shape still supports appropriate automated testing without unnecessary framework coupling
- type checking passes or is explicitly not applicable
- lint passes or is explicitly not applicable
- verification is complete
- no unresolved correctness, security, or convention issues remain
- the handoff is clear enough that the user does not need to reverse-engineer the work

## State contract

Agents must keep task state explicit. The Copilot-specific state bridge lives in `.github/workflow-state.json`.

At minimum, state must include:

- current phase
- task identifier or short title
- requirements status
- acceptance criteria
- constraints
- open questions
- plan status
- files in scope
- implementation status
- quality gate status
- verification status
- delivery readiness
- retry count and blocked items

If state is missing or stale, refresh it before taking risky actions.

## Recovery contract

When something fails:

1. identify the failing phase
2. read the actual failure signal
3. find the root cause
4. roll back to the earliest required phase
5. fix deliberately
6. rerun all required downstream gates

Never patch blindly.

### Retry budget

- default maximum: 3 repair attempts per work item
- after the budget is exhausted, mark the work item as blocked
- record the blocker, current evidence, and the recommended rollback phase

## Consistency contract

Agents must be predictable:

- reuse existing architecture and conventions
- do not invent naming schemes or folder structure changes
- keep prompts, skills, and agents aligned with the same phase model
- keep always-on guidance short and stable
- move detailed procedures into on-demand skills

## Convention contract

The workflow is contract-driven, not reference-driven.

- sample repositories, generated apps, and migrations can validate the workflow, but they are not the source of truth
- the source of truth is the local workflow contract expressed through `AGENTS.md`, instructions, prompts, skills, profiles, and hooks
- prefer convention over deliberation: remove recurring structural decisions from task-level reasoning when the workflow can decide them once

Classify convention decisions into these tiers:

- Hard conventions: fixed rules that should not drift without an explicit user or profile-level decision
- Strong defaults: preferred answers that should be reused unless the plan records a justified deviation
- Local freedom: implementation details that may vary inside a stable contract without harming consistency

Examples:

- Hard conventions: workflow phase order, state contract, required quality gates, required route or boundary grammar, required naming schemes declared by the active profile
- Strong defaults: recommended repo topology, recommended module shapes, preferred library choices, preferred verification paths
- Local freedom: helper extraction, internal function decomposition, local component factoring, small private naming choices that do not change public grammar

Rules:

- Planning must state when work follows strong defaults and when it intentionally deviates from them
- Review must treat hard-convention violations as blocking unless the requirements changed deliberately
- Review may treat unjustified strong-default drift as a finding even when the code still works
- Local-freedom variation is acceptable unless it harms correctness, testability, or future consistency
- do not use a sample repository as the reason a design is correct; use the contract that governs the repository

## Delegation model

Use specialized roles when available:

- Requirements Analyst: clarify intent and acceptance criteria
- Planner: design the implementation approach
- Implementer: make approved changes
- Reviewer: inspect correctness, risk, and convention fit before final gates and delivery
- Verifier: run gates, verify behavior, and prepare delivery evidence
- Orchestrator: own state, sequencing, rollback decisions, and handoff

Reviewer handoffs are part of the implementation-to-verification path. They do not create a seventh workflow phase.

All sub-agent communication flows through the orchestrator or active lead agent. Sub-agents are stateless.

## Parallelism rules

Parallel work is allowed only when tasks are independent.

Safe to parallelize:

- read-only research
- independent implementation tasks with no shared files or dependencies
- independent validation steps that do not mutate the same state

Must stay sequential:

- discovery -> planning -> implementation
- fixes after a failing gate
- review -> fix -> rerun gates
- delivery after verification

## Token efficiency rules

- keep always-on files concise and stable
- load deep process detail from skills only when relevant
- avoid repeating the same context in multiple artifacts
- prefer summaries with evidence over long narration
- do not spend tokens on speculative fixes or unnecessary explanation

## Artifact roles

- `AGENTS.md`: canonical workflow and operating contract
- `.github/copilot-instructions.md`: concise Copilot always-on summary
- `.github/instructions/`: targeted overlays by file type or concern
- `.github/prompts/`: repeatable user entrypoints
- `.github/skills/`: deep, on-demand procedures and checklists
- `.github/agents/`: specialized personas and handoffs
- `.github/hooks/`: deterministic enforcement and state-aware reminders

When adding new artifacts, extend the system without duplicating the same rule set verbatim across multiple files.
