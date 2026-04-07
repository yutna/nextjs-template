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

## Gap Status (as of 2026-04-06)

All previously logged high/medium gaps for this mindset pass have been addressed, including the latest template workflow/convention rollout slice:

1. Copilot workflow docs were reframed to orchestration-first and automation-first.
2. Template structure baseline now passes workflow audit.
3. Contributing parity section now states automation-by-default with optional local fallback checks.
4. CI now enforces workflow structure baseline in the workflow-contract job.
5. Template lint now enforces `project/no-root-grab-bag-files` on approved high-signal implementation surfaces.
6. `project/no-inline-param-type-literals` now covers shared lib/helper rollout surfaces after local debt cleanup.
7. A staged `project/no-local-type-declarations` rule now runs on the same shared lib/helper rollout surface.

Verification snapshot:

- `./bin/vibe task workflow:audit` → pass
- `./bin/vibe parity-check` → pass
- `npm run check-types` → pass
- `npm run lint` → pass
- `npm test` → pass
- `npm run workflow:state:validate` → pass

### Aligned Improvements Already Applied

- Hook config generation is now automatic during Copilot sync.
  - bin/cli/commands/sync-copilot.ts:16
  - bin/cli/commands/sync-copilot.ts:358
  - bin/cli/commands/sync-copilot.ts:359
- Template lint now includes staged custom convention enforcement for approved rollout surfaces.
  - `project/no-root-grab-bag-files`
  - `project/no-inline-param-type-literals`
  - `project/no-local-type-declarations`
- Shared lib/helper debt was cleaned before widening the staged lint rollout, so the template can claim completion for the latest slice without overstating repo-wide convention closure.

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
- Keep Claude↔Copilot parity automatic — avoid manual sync steps
- Widen staged convention rules only after cleaning debt on the next target surfaces
- Platform limitation: GitHub Copilot agent mode cannot be switched programmatically; the one remaining manual step is intentional

See [Commands Reference](./COMMANDS.md) for all available CLI and AI toolchain commands.
