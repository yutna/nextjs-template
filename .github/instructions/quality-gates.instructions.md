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
4. verification against acceptance criteria

Rules:

- use only the checks that already exist in the project
- if a check does not exist, mark it `not-applicable` and record why
- if any automated gate fails, fix the root cause and rerun every automated gate from the beginning
- do not present work as done while any required gate is pending, failing, or unverified
- do not confuse green automation with correct UX; verification still matters

Record results in [`.github/workflow-state.json`](../workflow-state.json) before delivery.
