---
name: rendered-ui-verification
description: Verify visible app changes in a real browser with responsive, theme, locale, and interaction checks. Use this when work affects rendered output.
---

# Rendered UI Verification

Use this skill during Verification for visible UI changes.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [quality gate instructions](../../instructions/quality-gates.instructions.md)
- [local runtime bootstrap](../local-runtime-bootstrap/SKILL.md)

## Use when

- a page, route, screen, or visible component changes
- layout or styling changes affect rendered output
- localization changes affect what users see
- theme or color-mode work changes the UI

## Usually not needed when

- the task is tooling-only
- the task is type-only or test-only
- the task changes workflow files without touching rendered output

## Preconditions

- expected behavior is known
- affected routes or stories are known
- applicable automated gates have already been run
- a dev server is available if route verification is required

## Verification flow

For each affected route or surface:

1. open it in a real browser
2. check load success, console errors, and failed requests
3. capture evidence for the current state
4. verify desktop layout
5. verify tablet layout when responsiveness matters
6. verify mobile layout when responsiveness matters
7. verify light and dark modes when the UI supports them
8. verify English and Thai when user-facing text is affected
9. verify interactions that changed

Storybook can speed up visual iteration, but it does not replace runtime browser verification for user-facing changes.

## Report format

Report each verified route or surface with:

- route or story name
- `PASS`, `FAIL`, or `PARTIAL`
- checks completed
- issues found
- evidence captured
- whether the task can stay in Verification or must return to Implementation

## Do not

- claim UI work is done from screenshots alone
- skip locale or theme checks when the change obviously affects them
- treat browser failures as optional polish
