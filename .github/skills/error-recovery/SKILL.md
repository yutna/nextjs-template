---
name: error-recovery
description: Recover from failures by classifying the problem, choosing the rollback phase, and fixing deliberately. Use this when tests, lint, type checks, reviews, or verification fail.
---

# Error Recovery

Use this skill whenever a gate, review, or verification step fails.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [workflow state](../../workflow-state.json)

## Recovery loop

1. Read the real failure signal.
2. Classify the failure:
   - unclear requirement
   - planning error
   - implementation bug
   - type or lint issue
   - test regression
   - verification mismatch
3. Choose the earliest rollback phase that can truly fix it.
4. Propose the smallest valid fix.
5. Increment the retry count.
6. Rerun downstream gates from the start.

## Retry policy

- default retry budget: 3 attempts per work item
- on exhaustion:
  - mark the item blocked
  - capture evidence
  - recommend the rollback phase or user input needed

## Do not

- rewrite unrelated areas
- apply speculative fixes without evidence
- continue forward when the current phase is no longer valid
