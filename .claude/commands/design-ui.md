---
description: Generate ASCII text wireframes for enterprise UI from a feature spec or state machine
argument-hint: "[feature name or path to docs/tasks/*.md]"
---

# /design-ui

Generate ASCII text wireframes for enterprise web UI from a feature specification or state machine.
Output is a visual prototype that covers all UI states and maps to route + component decisions.

## Behavioral Mode

You are in **UI Design** phase. Do not write implementation code.
Read existing task files. Output wireframes only.

## Prerequisites

Check for existing task files first:

- `docs/tasks/` — look for a relevant `*.md` spec file
- If none exists, ask user to run `/decompose-requirements` first, or accept a direct feature description

## Skills to Activate

1. `ui-ascii-wireframe` — ASCII component vocabulary, state rendering rules, output format
2. `enterprise-ui-recipes` — recipe selection (R01–R10), page anatomy, density mode, state checklist
3. `nextjs-route-design` — route map, URL structure, parallel/intercepting route decisions

## Process (execute in order)

### Step 1: Read the Feature Spec

If a `docs/tasks/*.md` file is provided or found:

- Extract: feature name, state machine states, transitions, acceptance criteria
- Identify: entities, user roles, data surfaces

If no spec file — ask user to describe the feature, then infer the state machine.

### Step 2: Select Recipe + Density

Using `enterprise-ui-recipes` §1–§3:

- Pick ONE recipe (R01–R10) that best fits the primary user action
- Declare density: `compact` (scan-heavy) or `cozy` (form-heavy)
- List which page anatomy regions are required for this feature

### Step 3: Design Route Map

Using `nextjs-route-design` §7 planning checklist:

- Map every URL: list, detail, modal (if applicable)
- Identify `(public)` vs `(private)` placement
- Identify any `@slot` parallel route needs (context panel, modal overlay)

### Step 4: Render Wireframes

Using `ui-ascii-wireframe` §5 output format:

- Render full app shell with active nav highlighted
- Render **every state** from the state machine as a separate wireframe:
  - loading, empty, error, permission-denied, populated (mandatory 5)
  - plus all custom states from the spec's state machine
- Annotate each wireframe with: component names, route, recipe, interactions

### Step 5: Render Flow Diagram

Show the complete user journey as ASCII flow:

```txt
[Entry point] → [Action] → [State] → [Action] → [State]
                                  ↘ [Error path] → [Error state]
```

### Step 6: Output Summary

End with a summary block:

```txt
Recipe:   R0X — name
Density:  compact | cozy
Route:    /[locale]/...
States:   loading, empty, error, permission-denied, populated, [custom...]
Regions:  section-page-header, toolbar-filter, table-data-region, ...
```

## Output Location

Print wireframes directly in chat for review.
If user approves, save to `docs/tasks/[feature-name]-ui-wireframe.md`.

## Rules

- Show ALL states — never only the happy path
- Use real-looking fake data (names, numbers, dates) — not placeholder text
- Total wireframe width: ~90 chars to fit in a terminal/chat
- Each wireframe shows the full page (nav + header + content) — not isolated components
- Do not write React code — wireframes only
- If the feature spans multiple screens (list + detail), wireframe each screen separately
