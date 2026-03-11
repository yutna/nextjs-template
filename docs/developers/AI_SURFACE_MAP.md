# AI_SURFACE_MAP

## Purpose

This guide explains which workflow surface matters for which kind of task.

## Mental model

- [`AGENTS.md`](../../AGENTS.md) defines the canonical workflow contract.
- [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md)
  is the concise always-on Copilot summary.
- `.github/instructions/` adds targeted overlays.
- `.github/prompts/` provides repeatable entrypoints.
- `.github/skills/` holds deeper procedures and checklists.
- `.github/agents/` defines specialist execution roles.
- `.github/hooks/` enforces deterministic guardrails.

## Fast decision table

| If you need to... | Start with | Load or read next | Best specialist |
| ----------------- | ---------- | ----------------- | --------------- |
| clarify a vague request | `discover-requirements.prompt.md` | `requirements-clarification` | `requirements-analyst` |
| turn approved scope into an implementation plan | `plan-implementation.prompt.md` | `implementation-planning` | `planner` |
| implement approved work | `implement-approved-plan.prompt.md` | `nextjs-template-patterns`, `code-style-reference`, relevant instructions | `implementer` |
| recover from a failing gate or bad fix | `recover-from-failure.prompt.md` | `error-recovery` | `reviewer` or `implementer` |
| run the canonical automated gates | `run-quality-gates.prompt.md` | `quality-gates` | `verifier` |
| verify UI behavior in a real browser | `verify-rendered-ui.prompt.md` | `rendered-ui-verification` | `verifier` |
| audit code-style or placement compliance | `validate-code-style-compliance.prompt.md` | `code-style-reference` | `reviewer` |
| bootstrap or re-check the local environment | `check-repo-readiness.prompt.md` | `repo-readiness`, `local-runtime-bootstrap` | `orchestrator` |
| keep workflow state current while phases change | `AGENTS.md` plus workflow state | `state-sync` | `orchestrator` |

## Quick rules

- Use a prompt when you want a repeatable starting point.
- Use a skill when you need deeper procedural guidance.
- Use an agent when you want a specialist role to execute a phase.
- Use instructions for scoped policy, not as a substitute for planning.
- Use hooks as guardrails, not as your primary source of understanding.

## Suggested defaults by adoption level

- Lite: mostly use `AGENTS.md`, the developer docs, and direct work.
- Standard: add prompts and skills as needed.
- Strict: use prompts, skills, agents, and workflow state together.

## Recommended onboarding sequence

If the `.github/` tree feels large, follow this order instead of opening
everything at once:

1. [`START_HERE.md`](./START_HERE.md)
2. [`WORKED_EXAMPLE.md`](./WORKED_EXAMPLE.md)
3. the reference route at `/en/reference-patterns`
4. the specific prompt, skill, or agent for your current phase
