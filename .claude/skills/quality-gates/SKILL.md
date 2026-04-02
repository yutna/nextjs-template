---
name: quality-gates
description: This skill should be used after implementation changes or after any fix that could affect correctness. Runs and interprets automated quality gates in the canonical order.
---

# Quality Gates

Use this skill during Quality Gates.

Reference:

- CLAUDE.md (workflow contract)
- .claude/workflow-state.json

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
6. Report weak automation that comes from hard-to-test code shape as a real design issue when it affects confidence.

## Output checklist

- checks run
- status per gate
- failure evidence, if any
- next phase decision
- testability debt or coverage-shape concerns, if any

## Do not

- skip straight to tests because earlier gates looked safe
- claim success from partial checks
- deliver before verification is complete
