---
name: delivery-validation
description: Validate readiness for delivery and produce a user-ready handoff. Use this after quality gates and verification are complete or nearly complete.
---

# Delivery Validation

Use this skill during Verification and Delivery.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [workflow state](../../workflow-state.json)

## Pre-delivery checklist

- requirements are satisfied
- automated gates are green or explicitly not applicable
- verification is complete
- blockers are explicit
- changed files and user impact are known

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
