---
name: state-sync
description: This skill should be used when the task changes phase, new files are touched, a gate result changes, or a blocker appears. Keeps workflow state current across phases.
---

# State Sync

Use this skill whenever task state changes.

Reference:

- CLAUDE.md (workflow contract)
- .claude/workflow-state.json

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
- do not invent pseudo-phase names such as `discovery-complete` or `planning-done`; keep `phase` to the six canonical values only
- if uncertainty remains, capture it in `requirements.openQuestions` or delivery notes instead of hiding it

## Recommended status vocabulary

- `needs-clarification`
- `clarified`
- `approved`
- `not-started`
- `in-progress`
- `completed`
- `proposed`
- `passed`
- `failed`
- `not-applicable`
- `blocked`
- `ready-for-review`

Accurate state is what makes strict hooks and deterministic recovery possible.

Exact enum reminders:

- `phase`: `discovery`, `planning`, `implementation`, `quality-gates`, `verification`, `delivery`
- `requirements.status`: `needs-clarification`, `clarified`, `approved`
- `plan.status`: `not-started`, `proposed`, `approved`, `blocked`
- `implementation.status`: `not-started`, `in-progress`, `completed`, `blocked`
- `delivery.status`: `blocked`, `ready-for-review`, `approved`

## Preferred write path

When a terminal is available, prefer the built-in state API over ad hoc manual edits:

```bash
printf '%s' '{"phase":"planning","requirements":{"status":"approved"}}' | \
  node .claude/hooks/scripts/workflow_hook.cjs update-state
```

Or use shorthand CLI arguments when that is easier in the current host:

```bash
node .claude/hooks/scripts/workflow_hook.cjs update-state \
  phase=implementation \
  implementation.status=in-progress
```

This keeps `version`, `lastUpdated`, schema validation, and transition validation consistent.
