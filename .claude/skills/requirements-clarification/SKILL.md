---
name: requirements-clarification
description: This skill should be used when the user asks to "clarify requirements", "start discovery", "define scope", or when the user intent is incomplete, ambiguous, or likely to cause implementation rework. Clarifies vague requests into scope, constraints, and acceptance criteria.
---

# Requirements Clarification

Use this skill during Discovery.

Reference:

- CLAUDE.md (workflow contract)
- .claude/workflow-state.json

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
   - use only `requirements.status = "needs-clarification" | "clarified" | "approved"`
   - prefer `requirements.status = "approved"` when Discovery is complete and Planning can start without more user input
   - use `requirements.status = "clarified"` when the discovery output is sufficient but still waiting on explicit approval
   - do not invent a separate completion phase; discovery remains `discovery` until Planning begins

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
