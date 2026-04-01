---
name: convention-tiering
description: This skill should be used when a task changes architecture, naming, folder structure, boundaries, or repository conventions. Classifies design decisions into hard conventions, strong defaults, and local freedom so plans and reviews stay contract-driven.
---

# Convention Tiering

Use this skill when a task changes architecture, naming, folder structure, boundaries, or repository conventions.

Reference:

- CLAUDE.md (workflow contract)
- .claude/workflow-profile.json

## Goals

- keep the workflow contract-driven instead of reference-driven
- reduce repeated structural deliberation
- separate blocking convention drift from acceptable local variation

## Process

1. List the design decisions the task touches.
2. Classify each one:
   - hard convention
   - strong default
   - local freedom
3. Preserve hard conventions automatically.
4. Reuse strong defaults unless the plan records a reason to deviate.
5. Allow local freedom only inside stable module, route, and boundary contracts.
6. If a repeated local decision keeps showing up, consider promoting it into a strong default or a hard convention.

## Planning checklist

- which hard conventions apply here?
- which strong defaults are being reused?
- does any deviation need explicit justification?
- are we relying on a contract, or merely copying a prior example?

## Review checklist

- is any hard convention being violated?
- is any strong default drifting without a recorded reason?
- is the remaining variation simply local freedom?

## Do not

- justify a design only because another repository happened to use it
- treat every structural difference as equally severe
- allow local freedom to spill into naming grammar, ownership boundaries, or public module shape
