---
name: repo-readiness
description: Layer repo-specific readiness checks such as coverage, production build, and Storybook build on top of the canonical gates. Use this when the task changes runtime or UI behavior enough to warrant stronger release confidence.
---

# Repo Readiness

Use this skill after the canonical quality-gate flow when the task needs stronger repository-level confidence.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [quality gates skill](../quality-gates/SKILL.md)
- [package.json](../../../package.json)

## Important

This skill extends the baseline workflow. It does not replace the canonical gate order from `AGENTS.md`.

## Consider these additional checks

- `npm run test:coverage`
- `npm run build`
- `npm run build:storybook`

## Typical applicability

- `npm run test:coverage`
  - behavior-changing work
  - new logic with new tests
  - fixes where coverage confidence matters
- `npm run build`
  - app runtime changes
  - route, provider, config, or rendering changes
- `npm run build:storybook`
  - presentational UI changes
  - component-library or Storybook-exposed changes

## Often not applicable

- workflow-only changes
- prompt or skill changes with no app impact
- docs-only changes

## Output checklist

- canonical gate status is known first
- each additional readiness check is marked `passed`, `failed`, or `not-applicable`
- any skipped extra check includes a reason
- the final recommendation says whether the task is ready for Verification or Delivery

## Do not

- redefine the core workflow by treating these checks as universal hard gates
- run extra checks blindly when the changed scope does not warrant them
- hide a failed build or coverage regression behind a green baseline gate summary
