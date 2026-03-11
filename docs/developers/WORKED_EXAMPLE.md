# WORKED_EXAMPLE

## Scenario

Use the `/[locale]/reference-patterns` route as the canonical example task.

The goal of that task is simple: add one public page that teaches the
template's architecture by showing a real route, real containers, one small
interactive form, and one server action with schema validation.

## Acceptance criteria for the example task

- the route entry stays thin and locale-aware
- the screen only assembles containers
- server-prepared data stays in a server container
- client interactivity stays inside a small client container plus hook
- the form submits through a server action validated by Zod
- the feature is localized and covered by tests or stories where relevant
- the change still passes the repo's normal gates

## Where the work lands

- `src/app/[locale]/(public)/reference-patterns/page.tsx`
- `src/modules/reference-patterns/**`
- `src/messages/en/modules/reference-patterns/**`
- `src/messages/th/modules/reference-patterns/**`
- `src/shared/routes/**`

## Phase walkthrough

### Discovery

Clarify that the page is a teaching example, not the start of a fake product.

Useful surfaces:

- `discover-requirements.prompt.md`
- `requirements-clarification`
- [`START_HERE.md`](./START_HERE.md)

### Planning

Decide the ownership boundaries before editing files.

The stable plan for this task is:

- route entry unwraps locale params and hands off to a screen
- screen assembles one server container and one client container
- server container prepares translated pattern cards
- client container binds a presenter to a hook
- hook calls a server action that uses a schema folder
- messages, route helpers, tests, and stories are updated together

Useful surfaces:

- `plan-implementation.prompt.md`
- `implementation-planning`
- `state-sync`

### Implementation

Follow the existing flow instead of inventing a shortcut.

- add the route entry
- add the screen
- add the containers
- add the presenter components
- add the hook, action, and schema
- add messages and route helpers
- add tests and stories beside the new concerns

Useful surfaces:

- `implement-approved-plan.prompt.md`
- `nextjs-template-patterns`
- `code-style-reference`
- `implementer`

### Quality Gates

Run the repository's existing commands in the canonical order.

1. `npm run check-types`
2. `npm run lint`
3. `npm run test`

Useful surfaces:

- `run-quality-gates.prompt.md`
- `quality-gates`

### Verification

Verify the route in a real browser.

- run the dev server
- open `/en/reference-patterns`
- confirm both sections render
- submit the form and confirm the preview updates

Useful surfaces:

- `verify-rendered-ui.prompt.md`
- `rendered-ui-verification`
- `verifier`

### Delivery

Summarize what changed, why the route exists, and what it teaches.

Useful surfaces:

- `verify-and-deliver.prompt.md`
- `delivery-validation`

## What this example teaches

- the workflow is phase-based, not tool-based
- the architecture is opinionated, but still small enough to inspect
- prompts, skills, and agents are there to reduce uncertainty, not to add
  ceremony for its own sake
