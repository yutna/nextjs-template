---
name: state-sync
description: Keep workflow state current across phases, tools, and agents. Use this when the task changes phase, new files are touched, a gate result changes, or a blocker appears.
user-invocable: false
---

# State Sync

Use this skill whenever task state changes.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [workflow state](../../workflow-state.json)

## Required updates

Update the state file whenever any of these change:

- current phase
- requirements status
- plan status
- files in scope
- files touched
- retry count
- blocked items
- quality gate results
- delivery readiness

## Rules

- keep state factual and current
- prefer explicit statuses over prose
- do not leave stale "pending" values after a gate has run
- if uncertainty remains, capture it in `requirements.openQuestions` or delivery notes instead of hiding it

## Recommended status vocabulary

- `needs-clarification`
- `clarified`
- `approved`
- `not-started`
- `in-progress`
- `proposed`
- `passed`
- `failed`
- `not-applicable`
- `blocked`
- `ready-for-review`

Accurate state is what makes strict hooks and deterministic recovery possible.

## Preferred write path

When a terminal is available, prefer the built-in state API over ad hoc manual edits:

```bash
printf '%s' '{"phase":"planning","requirements":{"status":"approved"}}' | \
  python3 .github/hooks/scripts/workflow_hook.py update-state
```

This keeps `version`, `lastUpdated`, schema validation, and transition validation consistent.
