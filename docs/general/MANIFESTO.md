# Manifesto: Automation-First Vibe Coding

Status: Active
Scope: Whole repository
Last Updated: 2026-04-06

This template exists so users can ship features fast with Claude and GitHub Copilot without repetitive setup.

Execution standard: [Workflow SOP (One Page)](./WORKFLOW-SOP.md)

## Product Intent

The template is battery-included and production-grade by default.

Primary goals:

- Comfort: minimal cognitive load and minimal repetitive commands
- Correctness: quality gates and workflow discipline are enforced
- Consistency: conventions are applied from first round, not after cleanup
- Production readiness: code should be shippable without setup churn

## Manual Work Should Stay Small

The template should minimize manual workflow overhead.

Today that means users still:

1. describe the task and approve the plan when the host tool asks
2. run `decompose-requirements` for large features
3. switch GitHub Copilot to orchestration agent mode when they want that workflow

Prompts, hooks, scripts, and CI should remove the rest of the routine coordination where the host tool allows it.

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

## Enforcement Snapshot

The repo already automates several high-signal checks:

- `./bin/vibe task workflow:audit`
- `./bin/vibe parity-check`
- `npm run check-types`
- `npm run lint`
- `npm test`
- `npm run workflow:state:validate`

These checks protect the enforced baseline, but they are not a guarantee that every downstream prompt, skill example, or workflow doc is already perfectly aligned. Periodic governance audits are still part of keeping the template honest.

## Acceptance Standard for Future Changes

Any refactor is acceptable only if it improves or preserves all four goals:

- Comfort
- Correctness
- Consistency
- Production readiness

If a change makes routine usage more manual, it is considered a regression.

## Implementation Direction

The latest template workflow/convention slice is closed. Ongoing direction:

- Keep scaffolding batteries-included so users spend time shipping features, not bootstrapping tools
- Extend `workflow:audit` rules as new patterns are adopted
- Keep Claude↔Copilot parity as automatic as the host tool allows — avoid unnecessary manual sync steps
- Widen staged convention rules only after cleaning debt on the next target surfaces
- Platform limitation: GitHub Copilot agent mode cannot be switched programmatically; the one remaining manual step is intentional

See [Commands Reference](./COMMANDS.md) for all available CLI and AI toolchain commands.
