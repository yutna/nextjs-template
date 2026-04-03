# Template Mindset: Automation-First Vibe Coding

Status: Active
Scope: Whole repository
Last Updated: 2026-04-03

This template exists so users can ship features fast with Claude and GitHub Copilot without repetitive setup.

## Product Intent

The template is battery-included and production-grade by default.

Primary goals:

- Comfort: minimal cognitive load and minimal repetitive commands
- Correctness: quality gates and workflow discipline are enforced
- Consistency: conventions are applied from first round, not after cleanup
- Production readiness: code should be shippable without setup churn

## Manual Actions Allowed (Only 2)

Users should manually do only:

1. Run decompose-requirements for large features
2. Switch GitHub Copilot agent to orchestration mode

Everything else should be automated by prompts, hooks, scripts, and CI.

## Automation Contract

The template should automate:

- Workflow phase guidance and state discipline
- Quality gates (type-check, lint, tests)
- Claude↔Copilot prompt/skill parity checks
- Hook configuration synchronization
- Convention enforcement and structural checks

Users should not need manual maintenance commands for routine consistency tasks.

## Consistency Contract

- Canonical conventions are enforced, not optional
- Template baseline should pass its own checks
- Generated/scaffolded code should comply on first generation
- Dual-toolchain outputs should stay aligned by default

## Production-Grade Contract

- 0 type errors
- 0 lint errors/warnings (project policy)
- tests passing
- no hidden manual setup needed to keep workflow healthy

## Gap Status (as of 2026-04-03)

All previously logged high/medium gaps for this mindset pass have been addressed:

1. Copilot workflow docs were reframed to orchestration-first and automation-first.
2. Template structure baseline now passes workflow audit.
3. Contributing parity section now states automation-by-default with optional local fallback checks.
4. CI now enforces workflow structure baseline in the workflow-contract job.

Verification snapshot:

- `./bin/vibe task workflow:audit` → pass
- `./bin/vibe parity-check` → pass
- `npm run check-types` → pass
- `npm run lint` → pass
- `npm test` → pass

### Aligned Improvements Already Applied

- Hook config generation is now automatic during Copilot sync.
  - bin/cli/commands/sync-copilot.ts:16
  - bin/cli/commands/sync-copilot.ts:358
  - bin/cli/commands/sync-copilot.ts:359

## Acceptance Standard for Future Changes

Any refactor is acceptable only if it improves or preserves all four goals:

- Comfort
- Correctness
- Consistency
- Production readiness

If a change makes routine usage more manual, it is considered a regression.

## Implementation Direction

Short-term:

- Update Copilot workflow docs to orchestration-first framing
- Make template baseline pass workflow structure audit
- Decide whether parity and structure checks should be mandatory in CI

Long-term:

- Keep adding battery-included scaffolding so users spend time shipping features, not bootstrapping tools
