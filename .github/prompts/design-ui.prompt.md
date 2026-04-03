---
name: design-ui
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
```
[Entry point] → [Action] → [State] → [Action] → [State]
                                  ↘ [Error path] → [Error state]
```

### Step 6: Write Markdown Artifacts

Persist results to markdown files under `docs/ui/<feature-slug>/`.
Use deterministic, file-safe kebab-case slugs.

Required files:
- `docs/ui/<feature-slug>/README.md`
  - Feature summary (recipe, density, route map, state inventory)
  - Links to all flow/state markdown files
- `docs/ui/<feature-slug>/flow-<nn>-<flow-slug>.md`
  - One file per flow in the user journey
  - Include flow-specific ASCII wireframes and transition notes
- `docs/ui/<feature-slug>/state-<nn>-<state-slug>.md`
  - One file per UI state
  - Include full-page wireframe + annotations + trigger/transition context

Where `nn` is a zero-padded sequence (`01`, `02`, ...).

### Step 7: Output Summary

In chat, return only a concise summary block and created file list:
```
Recipe:   R0X — name
Density:  compact | cozy
Route:    /[locale]/...
States:   loading, empty, error, permission-denied, populated, [custom...]
Regions:  section-page-header, toolbar-filter, table-data-region, ...
Files:    docs/ui/<feature-slug>/README.md
          docs/ui/<feature-slug>/flow-01-<flow-slug>.md
          docs/ui/<feature-slug>/state-01-<state-slug>.md
```

## Output Location

Always write output artifacts directly to `docs/ui/<feature-slug>/`.
Do not keep wireframes chat-only.
Chat output should be a brief summary + artifact paths.

## Rules

- Show ALL states — never only the happy path
- Use real-looking fake data (names, numbers, dates) — not placeholder text
- Total wireframe width: ~90 chars to fit in a terminal/chat
- Each wireframe shows the full page (nav + header + content) — not isolated components
- Do not write React code — wireframes only
- If the feature spans multiple screens (list + detail), wireframe each screen separately
- Persist every flow and state as markdown artifacts under `docs/ui/<feature-slug>/`
