---
name: delivery-validation
description: This skill should be used after quality gates and verification are complete or nearly complete. Validates readiness for delivery and produces a user-ready handoff.
---

# Delivery Validation

Use this skill during Verification and Delivery.

Reference:

- CLAUDE.md (workflow contract)
- .claude/workflow-state.json

## Pre-delivery checklist

- requirements are satisfied
- automated gates are green or explicitly not applicable
- verification is complete
- blockers are explicit
- changed files and user impact are known
- no obvious testability debt is silently weakening the claimed coverage

## Process

1. Check acceptance criteria against the implemented behavior.
2. Confirm the quality gate record.
3. Summarize what changed in user-facing terms.
4. Note any follow-up items or blocked items honestly.
5. Update workflow state:
   - `phase = "delivery"`
   - `delivery.status = "ready-for-review"` only when the work is truly reviewable

## Do not

- say "done" when the work is merely "implemented"
- hide caveats that will force the user to debug or guess
