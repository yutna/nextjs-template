# ADOPTION_LEVELS

## Purpose

This guide helps teams choose how much of the template's workflow and AI
customization system to adopt on day one.

## Invariants that never change

- [`AGENTS.md`](../../AGENTS.md) remains the canonical workflow contract.
- [`CODE_STYLE_GUIDES.md`](./CODE_STYLE_GUIDES.md) remains the permanent
  code-style and placement law.
- Non-trivial work still needs a clear plan before implementation.
- Delivery still requires applicable quality gates and verification.
- Layer boundaries stay the same across every adoption level.

## Levels at a glance

| Level | Best for | What stays mandatory | What becomes optional |
| ----- | -------- | -------------------- | --------------------- |
| Lite | solo developers, template evaluation, small docs/config changes | README, START_HERE, CODE_STYLE_GUIDES, CONTRIBUTING, applicable gates | most prompts, specialist agents, extra AI surfaces unless needed |
| Standard | most teams and active feature work | workflow state for non-trivial tasks, code-style law, normal gate order, targeted prompts/skills when helpful | strict role handoffs for every task |
| Strict | teams standardizing on Copilot-first collaboration | explicit phase tracking, specialist roles, prompts/skills/agents used consistently, full review and verification trail | very little; this is the full operating model |

## Lite

Use Lite when you want the template's architecture without adopting the full
Copilot operating system immediately.

- Read [`START_HERE.md`](./START_HERE.md) and
  [`CODE_STYLE_GUIDES.md`](./CODE_STYLE_GUIDES.md) first.
- Use the six-phase workflow for non-trivial work, but keep the tooling
  surface small.
- Reach for prompts, skills, and specialist agents only when the task is
  ambiguous, risky, or already failing.
- Keep delivery lightweight, but still run the applicable gates before you
  call work done.

## Standard

Standard is the recommended default.

- Keep [`.github/workflow-state.json`](../../.github/workflow-state.json)
  current for every non-trivial task.
- Use the decision rules in [`AI_SURFACE_MAP.md`](./AI_SURFACE_MAP.md)
  instead of trying to memorize the entire `.github/` tree.
- Use the worked example and reference route to onboard new contributors.
- Compress roles when one person is doing the work, but do not skip the
  phase outcomes.

## Strict

Strict is for teams that want the template to behave like a guided delivery
system instead of a loose starter.

- Treat prompts, skills, agents, hooks, and workflow state as part of the
  normal path, not optional extras.
- Make phase transitions explicit and keep state synchronized.
- Expect planner, implementer, reviewer, and verifier style handoffs on
  substantial tasks.
- Prefer explicit recovery over ad hoc fixes when gates fail.

## How to choose

Start with Standard unless one of these is true:

- choose Lite if you are still evaluating the template or you want minimal
  process overhead while learning the architecture
- choose Strict if multiple developers rely on the same Copilot workflow and
  you want the repository's AI surfaces enforced consistently

## How to move between levels

You do not need a rewrite to move up or down.

- Lite to Standard: adopt workflow-state updates and the AI surface map.
- Standard to Strict: add explicit specialist-role handoffs and use prompts
  or skills consistently.
- Strict to Standard: keep the phase model and quality gates, but allow more
  direct execution without formal handoffs on every task.

## Recommendation

If you are unsure, start with Standard, use
[`START_HERE.md`](./START_HERE.md), and inspect the live reference example
at `/en/reference-patterns` after `npm run dev`.
