---
name: quality-gates
description: Run and interpret automated quality gates in the canonical order. Use this after implementation changes or after any fix that could affect correctness.
---

# Quality Gates

Use this skill during Quality Gates.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [quality gate instructions](../../instructions/quality-gates.instructions.md)
- [workflow state](../../workflow-state.json)

## Canonical order

1. type check
2. lint
3. tests
4. verification handoff

## Process

1. Discover which checks actually exist in the repository.
2. Run each applicable gate in order.
3. Mark missing gates as `not-applicable` with a reason.
4. If a gate fails:
   - capture the exact failure
   - identify the likely root cause
   - return to Implementation or Planning as needed
   - rerun the entire automated gate sequence after the fix
5. Update workflow state with the latest gate results.

## Output checklist

- checks run
- status per gate
- failure evidence, if any
- next phase decision

## Do not

- skip straight to tests because earlier gates looked safe
- claim success from partial checks
- deliver before verification is complete
