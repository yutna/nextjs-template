---
name: requirements-clarification
description: Clarify vague requests into scope, constraints, and acceptance criteria. Use this when the user intent is incomplete, ambiguous, or likely to cause implementation rework.
---

# Requirements Clarification

Use this skill during Discovery.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [workflow state](../../workflow-state.json)

## Goals

- identify the real problem behind the request
- surface ambiguity before planning
- convert vague asks into verifiable acceptance criteria

## Process

1. Restate the request in outcome terms.
2. Separate in-scope work from out-of-scope work.
3. Capture constraints, assumptions, and risks.
4. Ask focused clarifying questions only where ambiguity changes behavior or scope.
5. Produce acceptance criteria that can be checked later.
6. Update workflow state:
   - `phase = "discovery"`
   - `requirements.status = "clarified"` or keep it unresolved if questions remain

## Output checklist

- problem statement
- scope and exclusions
- constraints
- acceptance criteria
- open questions
- planning readiness decision

## Do not

- jump into implementation details
- create a file-by-file plan yet
- claim readiness when key ambiguity remains
