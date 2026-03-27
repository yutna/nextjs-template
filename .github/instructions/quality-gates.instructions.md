---
name: Quality Gates
description: Validation order, rerun rules, and delivery gates.
applyTo: "**"
---
# Quality gates

Use the quality-gate sequence from [AGENTS.md](../../AGENTS.md).

Canonical order:

1. type check
2. lint
3. tests

Rules:

- use only the checks that already exist in the project
- if a check does not exist, mark it `not-applicable` and record why
- if any automated gate fails, fix the root cause and rerun every automated gate from the beginning
- if automation is weak because the changed code shape is hard to test, record that as a design issue instead of treating it as normal
- do not present work as done while any required gate is pending, failing, or unverified
- do not confuse green automation with correct UX; verification still matters

Verification against acceptance criteria remains a separate workflow phase after automated gates are green.

Record results in [`.github/workflow-state.json`](../workflow-state.json) before delivery.
