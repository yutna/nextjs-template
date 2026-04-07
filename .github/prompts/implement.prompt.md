---
name: implement
description: Execute an approved plan without expanding scope.
---
Implement the approved work and stay inside the agreed scope.

Behavioral mode: Implementation. Stay in scope, preserve conventions, keep state current.

Workflow contract and required skill invocation:

- [AGENTS.md](../../AGENTS.md) (workflow contract)
- Invoke the [convention-tiering skill](../skills/convention-tiering/) first to keep
  hard conventions explicit.
- Then invoke the [code-conventions skill](../skills/code-conventions/) before
  editing files or generating code.
- Use the [state-sync skill](../skills/state-sync/) whenever phase, files touched,
  blocked items, or gate status changes.

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
- use checkpoint-stop behavior for non-trivial work: pause after each major layer or batch instead of silently expanding scope
- if implementation exceeds the approved slice, stop and return to Planning instead of continuing in one batch
- keep one file focused on one primary responsibility; move non-primary helpers, constants, and internal functions to dedicated files or scoped `helpers.ts`
- do not declare types inside implementation files; place them in `types.ts` or an appropriate `types/` folder
- use only `implementation.status = "not-started" | "in-progress" | "completed" | "blocked"`
- keep `.claude/workflow-state.json` current while implementing
- when implementation stabilizes, use `/review` before final quality gates and delivery
- do not run `git commit`, `git push`, release, or PR commands unless the user explicitly asks
- stop after implementation is complete; do not continue into quality gates or delivery unless asked
