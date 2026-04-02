---
description: Execute an approved plan without expanding scope.
argument-hint: "[approved plan summary]"
---
Implement the approved work and stay inside the agreed scope.

Behavioral mode: Implementation. Stay in scope, preserve conventions, keep state current.

Follow:

- CLAUDE.md (workflow contract)
- .claude/skills/convention-tiering/SKILL.md
- .claude/skills/state-sync/SKILL.md

Required output:

1. What was implemented
2. Files changed
3. Tests added or updated
4. Any newly discovered risks or blockers
5. Recommended next validation step

Rules:

- stay inside the approved scope
- preserve hard conventions and follow strong-default decisions from the approved plan
- do not change architecture or conventions without a recorded reason
- if the plan becomes invalid, stop and return to Planning
- update tests for changed behavior when the repository supports tests
- you may run a narrow smoke test, but do not mark quality gates complete
- use only `implementation.status = "not-started" | "in-progress" | "completed" | "blocked"`
- keep `.claude/workflow-state.json` current while implementing
- when implementation stabilizes, use `/review` before final quality gates and delivery
- do not run `git commit`, `git push`, release, or PR commands unless the user explicitly asks
- stop after implementation is complete; do not continue into quality gates or delivery unless asked
