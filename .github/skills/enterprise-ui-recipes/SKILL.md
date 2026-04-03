---
name: enterprise-ui-recipes
description: >
  Use this skill when generating enterprise admin, back-office, or operations module UI.
  Activates on: new module screen, admin panel, dashboard, operations list, approval queue,
  entity detail, multi-step form wizard, RBAC console, audit log, analytics cockpit, support console,
  settings page, or any layout described as "enterprise", "compact", or "admin-heavy".
  Provides recipe selection, page anatomy contract, density mode, state checklist, and AI prompt template.
---

# Enterprise UI Recipes

## 1. Recipe Selector (pick ONE per page)

| Recipe | Use Case Keywords |
|--------|-------------------|
| **R01** Operations List + Bulk Actions | user list, order list, ticket queue, inventory, any CRUD table |
| **R02** Entity Detail + Activity | account profile, order detail, case detail, record view |
| **R03** Multi-Step Wizard | onboarding, procurement, complex setup, 3+ step form |
| **R04** Approval Queue | request approval, compliance check, reimbursement review |
| **R05** Analytics Cockpit | KPI dashboard, executive report, monitoring, performance |
| **R06** Settings Matrix | app settings, feature flags, integration config |
| **R07** RBAC Console | role management, permission matrix, user-group assignment |
| **R08** Audit Log Explorer | security log, event log, compliance trail |
| **R09** Support Console | conversation list, ticket handling, SLA tracking |
| **R10** Planning Board | roadmap, execution tracking, capacity planning |

**Decision rule**: if multiple recipes match, pick the one that covers the primary user action.

---

## 2. Page Anatomy Contract

Every page must answer 4 questions (sections in strict order):

1. **Where am I?** → `PageHeader` (title, breadcrumb, context badges)
2. **What is the status?** → `KpiStrip` (skip for non-analytics pages)
3. **What can I do now?** → `ControlRow` (filter, search, segmentation)
4. **What is the content?** → `PrimaryContentRegion` (table / board / form / chart)
5. **What is the detail?** → `ContextPanel` (side panel — skip when not needed)

**Enforcement checklist** (block generation if any missing):

- [ ] `section-page-header` includes title + primary action button
- [ ] `toolbar-filter` preserves filter state in URL via `nuqs`
- [ ] `table-data-region` / primary content handles ALL 5 states (see §4)
- [ ] `drawer-context-panel` opens on row click; dedicated route button for full detail (R01)

---

## 3. Density Mode

| Mode | When to use | Token behavior |
|------|-------------|----------------|
| `cozy` | Settings, onboarding, content authoring | Large padding, body text `md`, fewer simultaneous controls |
| `compact` | Operations, finance, compliance, audit | Tight row heights, table cells dense, reduced vertical whitespace |

**Decision rule**: if the primary action is scanning/filtering rows → `compact`; if the primary action is reading/filling fields → `cozy`.

Use `data-density="compact"` or `data-density="cozy"` as a CSS attribute on the page root for Chakra system token switching.

---

## 4. State Completeness Checklist (mandatory)

Every `PrimaryContentRegion` must implement:

- [ ] **Loading** — `<Skeleton>` rows/cards (Chakra), not spinner-only
- [ ] **Empty** — `<EmptyState>` (Chakra) with actionable CTA (e.g. "Create first X")
- [ ] **Error** — `<Alert status="error">` (Chakra) inline with retry action; **not** a full page error
- [ ] **Success / Populated** — the happy path
- [ ] **Permission Denied** — `<Alert status="warning">` or custom `no-access` using `<EmptyState>` (Chakra)

Block delivery if any state is missing.

---

## 5. Recipe Structure Reference

### R01 — Operations List + Bulk Actions

```
section-page-header   (title + Create + Export)
section-kpi-strip     (3-4 operational counters)
toolbar-filter        (search + status + date range + owner) [nuqs]
table-data-region     (row-select + bulk-action bar)
drawer-context-panel  (selected row summary — opens on row click)
```

Key rules:
- Bulk action bar appears **only when rows are selected**
- Filter state in URL (`nuqs`)
- Row click → side panel; dedicated "Open" button → full detail route

### R02 — Entity Detail + Activity Timeline

```
section-breadcrumb + section-entity-header (title + status badges)
section-detail-layout (two-column):
  Left:  section-primary-detail (above fold)
  Right: list-activity-timeline (icon + label + timestamp)
card-related-entity (attachments, comments, linked records)
```

Key rules:
- Core metadata visible above the fold
- Timeline: icon + concise label + timestamp per entry

### R03 — Multi-Step Wizard

```
section-stepper-header (step count + current state)
form-wizard-step + section-summary-sidebar
section-action-bar sticky (Back | Save Draft | Next/Submit)
```

Key rules:
- Validate per step before advancing
- Save draft must not lose context on reload

### R04 — Approval Queue

```
toolbar-filter (priority + SLA + assignee)
section-split-layout:
  Left:  list-approval-queue (urgent items first)
  Right: section-decision-panel (approve / reject / escalate)
```

Key rules:
- Reject / Escalate require reason input
- SLA timer visible per item

### R05 — Analytics Cockpit

```
section-kpi-strip
section-trend-charts + list-top-items + section-anomaly-panel
table-drill-down (below charts)
```

Key rules:
- Time range picker updates ALL widgets atomically
- Show data freshness date + source confidence

### R06 — Settings Matrix

```
nav-category (left)
form-settings-area (right)
drawer-audit-history (sensitive sections only)
```

Key rules:
- Warn before destructive changes
- Group changes; support review-before-save pattern

### R07 — RBAC Console

```
table-roles + section-role-detail-tabs
table-permission-matrix (resource × action)
section-assignment-panel (users / groups)
```

Key rules:
- Show **effective** permissions, not only assigned
- Support compare mode (two roles side-by-side)

### R08 — Audit Log Explorer

```
toolbar-filter (actor + action + target + time range)
table-audit-log (optimized for scan speed — monospace actor)
drawer-event-detail (full payload + metadata)
```

Key rules:
- Default sort: latest event first
- Immutable event ID always visible

### R09 — Support Console Workspace

```
list-conversation
section-conversation-panel
section-customer-context
```

Key rules:
- SLA timer always visible
- "Next Best Action" widget visible and actionable

### R10 — Planning Board

```
section-segment-controls (quarter + stream + owner)
section-board-list-toggle
section-capacity-risk-widgets
```

Key rules:
- Constraints visible **before** commit actions
- Drag-and-drop optional; keyboard-first for core usage

---

## 6. AI Generation Prompt Template

When asking AI to generate a module screen, always specify:

```
Recipe: R0X
Density: compact | cozy
Required regions: [section-page-header, section-kpi-strip?, toolbar-filter, table-data-region, drawer-context-panel?]
Required states: loading, empty, error, permission-denied, success
Primary success metric: <what the user achieves on this screen>
Keyboard-first: yes | no
```

Example:

> "Generate a compact operations module using R01. Include section-page-header, section-kpi-strip, toolbar-filter, table-data-region, drawer-context-panel. Implement all 5 states. Optimize for keyboard-first usage and high scan speed. Primary metric: user can bulk-update status in <5 clicks."

---

## 7. Shared Components (place in `shared/components/` when used by 2+ modules)

Follow the repo naming convention: `<semantic-type>-<name>/` (kebab-case folder, matching `.tsx` file inside).

Semantic type prefixes for enterprise UI: `section-`, `table-`, `toolbar-`, `drawer-`, `list-`, `card-`, `nav-`, `form-`.

| Folder name | Component name | Purpose |
|-------------|---------------|---------|
| `section-page-header/` | `SectionPageHeader` | Title + breadcrumb + primary actions |
| `section-kpi-strip/` | `SectionKpiStrip` | Row of metric cards |
| `toolbar-filter/` | `ToolbarFilter` | Search + filter controls wired to nuqs |
| `table-data-region/` | `TableDataRegion` | Table wrapper with row selection + bulk actions |
| `drawer-context-panel/` | `DrawerContextPanel` | Slide-out detail panel |
| `section-state-boundary/` | `SectionStateBoundary` | loading / empty / error / no-access switcher |
| `section-action-bar/` | `SectionActionBar` | Sticky bottom bar for bulk or wizard actions |

Single-module components live in `modules/<name>/components/` using the same naming convention.

---

## 8. Chakra UI v3 + Ark UI Primitive Mapping

Reach for these primitives when building enterprise regions. **Chakra first; Ark UI for richer interactions.**

### Layout scaffolding

| Need | Chakra primitive |
|------|------------------|
| App shell (sidebar + main) | `Grid` with `templateColumns="240px 1fr"` |
| Page header row (title + actions) | `Flex justify="space-between" align="center"` |
| Two-column detail layout | `Grid templateColumns="1fr 1fr"` or `SimpleGrid columns={2}` |
| KPI strip | `SimpleGrid columns={4}` of `Card` + `Stat` |
| Sticky action bar | `Box position="sticky" bottom={0}` inside `Flex` |

### Data display

| Need | Primitive |
|------|----------|
| Data table | Chakra `Table` + `Thead` / `Tbody` / `Tr` / `Th` / `Td` |
| Row selection + bulk actions | Chakra `Checkbox` per row + `HStack` bulk bar (conditional render) |
| Status badge | Chakra `Badge` with `colorPalette` variant |
| Stat / KPI card | Chakra `Stat` (`StatLabel`, `StatNumber`, `StatHelpText`) |
| Activity timeline | Chakra `Timeline` (v3) or `Stack` + `Box` with left border |
| Tabs inside detail | Chakra `Tabs` + `TabList` / `TabPanels` |

### Overlays and navigation

| Need | Primitive |
|------|----------|
| Context side panel | Chakra `Drawer` (`placement="right"`) |
| Confirmation dialog | Chakra `Dialog` |
| Toast notification | Chakra `Toaster` + `createToaster()` |
| Category nav (settings) | Chakra `Stack` of `Button variant="ghost"` or Ark UI `TreeView` |
| Stepper (wizard) | Ark UI `Steps` |

### Form controls

| Need | Primitive |
|------|----------|
| Text search | Chakra `InputGroup` + `Input` |
| Status / type filter | Chakra `Select` (simple) or Ark UI `Select` (searchable) |
| Date range filter | Ark UI `DatePicker` |
| Combobox with search | Ark UI `Combobox` |
| Toggle / feature flag | Chakra `Switch` |
| Permission checkbox matrix | Chakra `Checkbox` in `Table` |

### Motion (use shared utilities — do not inline)

| Need | Import |
|------|--------|
| Page / section enter | `MotionReveal` from `@/shared/components/motion-reveal` |
| Staggered KPI cards | `MotionStagger` from `@/shared/components/motion-stagger` |
| Filter change transitions | `MotionPresence` from `@/shared/components/motion-presence` |

### Anti-patterns (forbidden)

- Do **not** use raw `div` / `span` where a Chakra semantic component exists
- Do **not** use `Spinner` as the only loading state — pair with `Skeleton`
- Do **not** open a `Drawer` for a flow that needs its own URL — use a route instead
- Do **not** use Ark UI primitives if a Chakra v3 equivalent exists and is sufficient
