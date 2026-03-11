# START_HERE

## Purpose

This guide gives new developers the shortest useful path through the
template.

## Read in this order

1. [`README.md`](../../README.md) for runtime setup and the project shape.
2. [`ADOPTION_LEVELS.md`](./ADOPTION_LEVELS.md) to choose Lite, Standard, or
   Strict.
3. [`CODE_STYLE_GUIDES.md`](./CODE_STYLE_GUIDES.md) for architecture,
   placement, naming, and boundary rules.
4. [`CONTRIBUTING.md`](../../CONTRIBUTING.md) for branch, PR, and release
   expectations.
5. [`AI_SURFACE_MAP.md`](./AI_SURFACE_MAP.md) if you plan to use the Copilot
   workflow surfaces directly.
6. [`WORKED_EXAMPLE.md`](./WORKED_EXAMPLE.md) for one end-to-end task.

## What you do not need on day one

You do not need to memorize every file under `.github/`.

- The always-on contract lives in [`AGENTS.md`](../../AGENTS.md) and
  [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md).
- The rest of the `.github/` tree is there to help when a task becomes
  ambiguous, risky, repetitive, or broken.

## Default happy path for a normal feature

| Phase | What to do | Where to look |
| ----- | ---------- | ------------- |
| Discovery | clarify the real request, scope, and acceptance criteria | `AGENTS.md`, `discover-requirements.prompt.md`, `requirements-clarification` |
| Planning | decide where the change belongs and how you will validate it | `plan-implementation.prompt.md`, `implementation-planning`, the reference route |
| Implementation | keep route files thin and push logic to the right layer | `CODE_STYLE_GUIDES.md`, `nextjs-template-patterns`, `code-style-reference` |
| Quality Gates | run the canonical order from the repo's existing scripts | `run-quality-gates.prompt.md`, `quality-gates` |
| Verification | confirm the UI and behavior match the acceptance criteria | `verify-rendered-ui.prompt.md`, `rendered-ui-verification` |
| Delivery | summarize honestly and keep remaining follow-up explicit | `verify-and-deliver.prompt.md`, `delivery-validation` |

## Open the concrete reference example

After `npm run dev`, visit `/en/reference-patterns`.

That route is intentionally small, but it shows the template's core pieces
working together:

- thin route entry
- screen assembly
- server container for translated data
- client container plus hook for interactivity
- server action plus schema validation
- localized message files and route helpers
- colocated tests and stories

## If you only have a few minutes

Do these five things first:

1. pick Standard in [`ADOPTION_LEVELS.md`](./ADOPTION_LEVELS.md)
2. read the project structure section in [`README.md`](../../README.md)
3. skim the ownership and boundary rules in
   [`CODE_STYLE_GUIDES.md`](./CODE_STYLE_GUIDES.md)
4. open `/en/reference-patterns`
5. run `npm run lint` before you trust your first change
