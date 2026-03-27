# Convention Tier Model

This document defines the workflow's convention model.

The workflow is contract-driven, not reference-driven.

- example repositories are validation targets
- migrations are stress tests
- generated output is evidence
- the source of truth is the workflow contract encoded in `AGENTS.md`, instructions, prompts, skills, profiles, and hooks

The operating principle is:

`convention over deliberation`

The goal is to remove repeated structural decisions from task-level reasoning so
AI agents can be faster, more predictable, and easier to audit.

## The three tiers

### 1. Hard conventions

Hard conventions are fixed rules.

They define the grammar of the repository and should not drift unless the user
or the active profile changes them explicitly.

Typical examples:

- workflow phase order
- workflow state contract
- required quality-gate sequence
- required route grammar
- required naming grammar
- required architectural boundaries

Review posture:

- treat violations as blocking by default

### 2. Strong defaults

Strong defaults are the preferred answers to recurring design questions.

They exist to keep AI from re-litigating the same structural choice every time.
They may change, but only when the plan records a reason.

Typical examples:

- recommended repo topology
- recommended module shapes
- preferred libraries for a concern
- preferred verification path
- preferred ownership boundary for a concern

Review posture:

- treat unjustified drift as a finding
- accept deviations only when the plan or requirements justify them

### 3. Local freedom

Local freedom is the implementation space that may vary without changing the
grammar of the repository.

Typical examples:

- private helper extraction
- internal function decomposition
- local component factoring
- small naming choices inside a stable module boundary

Review posture:

- allow variation unless it hurts correctness, testability, or future consistency

## Planning rule

Planning should answer three questions:

1. Which hard conventions apply here?
2. Which strong defaults are being reused?
3. Is any deviation from those defaults justified?

If a plan cannot answer those questions, the design is still too implicit.

## Review rule

Review should not treat every difference as equally important.

- hard-convention drift is usually blocking
- strong-default drift is often a finding
- local-freedom variation is usually acceptable

This keeps review focused on the decisions that most affect long-term
consistency.

## Profile rule

Repository profiles should capture the active convention grammar, not only
commands and paths.

At minimum, a profile should express:

- the decision model
- the naming or boundary grammar that acts as hard conventions
- the defaults the repository expects AI to reuse
- the implementation space where local variation is allowed

## Why this matters

Without a tiered convention model:

- AI agents improvise too much
- review spends too much time on repeated structure debates
- migrations become archaeology
- consistency depends on memory instead of contract

With a tiered convention model:

- AI reasoning gets narrower and faster
- output becomes more predictable
- audits become sharper
- repository evolution becomes easier to control
