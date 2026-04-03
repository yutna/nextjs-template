# Enterprise UX/UI Draft Blueprint and Recipe Catalog

Status: Draft
Audience: Product teams building heavy admin applications with this template
Stack Fit: Next.js 16 App Router, Chakra UI v3, Ark UI, Effect, next-intl
Last Updated: 2026-04-03

## Why This Exists

Many teams report that AI-generated UI for enterprise back-office modules looks generic when using Chakra as the base, while Tailwind/shadcn outputs often look more polished out of the box.

This is usually not a Chakra capability problem. It is a pattern-density problem:

- AI has far more high-quality Tailwind/shadcn examples in training and public references.
- Enterprise UX needs explicit flow structure, not only pretty components.
- If prompts do not enforce a page grammar, AI falls back to safe but bland layouts.

This draft solves that gap by giving AI a stronger UI operating system for this repository.

## Design Position

Opinionated by default, flexible by intent.

- Opinionated: strong defaults for page anatomy, layout rhythm, component hierarchy, and states.
- Flexible: each module can switch density, panel complexity, and interaction depth without breaking the shared visual language.

## Enterprise UI Blueprint (Draft)

### 1) App Shell Grammar

Default shell for admin-heavy products:

- Left rail navigation: module groups, quick access, environment badge.
- Top command bar: global search, create action, notifications, profile.
- Main canvas: page header, metric strip, control row, content region, contextual side panel.

Suggested Chakra primitives:

- `Grid` for shell scaffold (`240px 1fr` desktop, stacked mobile).
- `Flex` for top command bar and page header actions.
- `Card`, `Tabs`, `Drawer`, `Dialog`, `Table`, `Skeleton`, `Alert`, `EmptyState` for core stateful content.
- Ark UI primitives where richer interactions are needed (combobox, date-picker, menu, tree-view).

### 2) Page Anatomy Contract

Every enterprise page should answer these 4 questions quickly:

1. Where am I? (context and hierarchy)
2. What is the current status? (KPIs and system state)
3. What can I do now? (primary and secondary actions)
4. What should I do next? (recommended next step)

Enforced section order:

1. `PageHeader`
2. `KpiStrip` (optional for non-analytics pages)
3. `ControlRow` (filters, search, segmentation)
4. `PrimaryContentRegion` (table, board, timeline, or form)
5. `ContextPanel` (details, activity, guidance)

### 3) Information Density Modes

Use explicit density modes per module:

- Cozy: onboarding, settings, content-authoring modules.
- Compact: operations, finance, compliance, and audit modules.

Token-level behavior (example intent):

- Cozy: larger paddings, larger body text, fewer simultaneous controls.
- Compact: tighter row heights, denser table cells, reduced vertical whitespace.

### 4) State Completeness Standard

Every data surface must include all key states:

- Loading
- Empty
- Error
- Success feedback
- Permission denied (where applicable)

No page is production-ready if only the happy path exists.

### 5) Motion and Feedback Rules

Use motion to guide orientation, not decoration:

- Page enter: subtle upward fade for content containers.
- Staggered reveal for KPI cards and list items.
- Clear transition for filter changes and sorting.
- Non-blocking toast for success; inline alert for recoverable errors.

Use shared motion utilities under [src/shared/lib/motion](src/shared/lib/motion).

## Mapping to Repository Architecture

### Route and Module Layering

For each module, keep responsibilities clear:

- Route shell: [src/app/[locale]](src/app/[locale])
- Screen composition: [src/modules](src/modules)
- Shared design primitives: [src/shared/components](src/shared/components)
- Cross-module style tokens/config: [src/shared/styles](src/shared/styles), [src/shared/config](src/shared/config)

Suggested pattern:

- `screens/` owns page anatomy order.
- `containers/` binds server/client interactions and filter state.
- `components/` renders presentational blocks with no business orchestration.

### Reusable Enterprise Building Blocks

Recommended shared components to establish visual consistency:

- `PageHeader`
- `KpiStrip`
- `FilterToolbar`
- `DataRegion`
- `ContextPanel`
- `StateBoundary` (loading/empty/error/no-access)
- `ActionBar`

These should live in shared when reused by 2+ modules.

## UX Flow Contract for AI Generation

When generating a new module screen, require AI to output:

1. Layout map (which regions exist and why)
2. Primary user journeys (happy path + critical alternative path)
3. State matrix (loading/empty/error/no-access/success)
4. Accessibility notes (keyboard flow, labels, focus behavior)
5. Mobile behavior (stacking rules and action prioritization)

This prevents attractive but fragile layouts.

## Recipe Catalog (Draft)

The following recipes are optimized for this stack and enterprise use cases.

### Recipe 01: Operations List + Bulk Actions

Use for: user management, orders, tickets, inventory.

Structure:

- `PageHeader` with create/export actions
- `KpiStrip` with 3-4 operational counters
- `FilterToolbar` with search, status, date range, owner
- `DataRegion` as table with row selection + bulk action bar
- `ContextPanel` with selected row summary

Key UX rules:

- Bulk actions appear only when rows are selected.
- Preserve filter state in URL (nuqs).
- Row click opens side panel; explicit button opens full detail route.

### Recipe 02: Entity Detail + Activity Timeline

Use for: account profile, order detail, case detail.

Structure:

- Breadcrumb + title + status badges
- Two-column content: primary details + timeline/activity
- Related entities cards (attachments, comments, linked records)

Key UX rules:

- Keep core metadata visible above the fold.
- Timeline must support quick scan (icons + concise labels + timestamps).

### Recipe 03: Multi-Step Create/Edit Wizard

Use for: onboarding, procurement flows, complex setup.

Structure:

- Stepper in header
- Main form region + summary sidebar
- Sticky action row (back, save draft, next, submit)

Key UX rules:

- Validate per step and show progress confidence.
- Allow save draft safely and restore context.

### Recipe 04: Approval Queue

Use for: request approvals, compliance checks, reimbursements.

Structure:

- Queue filters (priority, SLA, assignee)
- Split layout: queue list + decision panel
- Decision actions grouped by risk level

Key UX rules:

- Highlight urgent items first.
- Require reason input for reject/escalate.

### Recipe 05: Analytics Cockpit

Use for: executive dashboards, performance monitoring.

Structure:

- KPI row
- Trend charts + top lists + anomaly panel
- Drill-down table under charts

Key UX rules:

- Time range switch updates all widgets consistently.
- Show data freshness and source confidence.

### Recipe 06: Settings Matrix

Use for: application settings, feature toggles, integration config.

Structure:

- Category navigation (left)
- Settings form area (right)
- Audit/history drawer for sensitive sections

Key UX rules:

- Warn before destructive changes.
- Group changes and support review-before-save.

### Recipe 07: Role and Permission Management

Use for: RBAC administration.

Structure:

- Roles table + role detail tabs
- Permission matrix (resource x action)
- Assignment panel for users/groups

Key UX rules:

- Make effective permissions visible (not only assigned values).
- Support compare mode between two roles.

### Recipe 08: Audit Log Explorer

Use for: security/compliance traceability.

Structure:

- Filter-heavy toolbar (actor, action, target, time)
- Log table optimized for scan speed
- Detail drawer with full payload and metadata

Key UX rules:

- Default sort by latest event.
- Keep immutable event identity visible.

### Recipe 09: Support Console Workspace

Use for: support teams handling conversations and issues.

Structure:

- Conversation list
- Main conversation panel
- Customer context side panel

Key UX rules:

- Always show current SLA timer.
- Keep “next best action” visible and actionable.

### Recipe 10: Cross-Team Planning Board

Use for: roadmap planning and execution tracking.

Structure:

- Segment controls (quarter, stream, owner)
- Board/list toggle
- Capacity and risk widgets

Key UX rules:

- Make constraints visible before commit actions.
- Keep drag-and-drop optional, not required for core usage.

## Prompting Guidance for Better UI Output

When asking AI to generate a module, include this structure:

- Target recipe ID
- Density mode (`cozy` or `compact`)
- Required page anatomy regions
- Required states
- Primary success metric for that screen

Example prompt skeleton:

"Create a compact operations module UI using Recipe 01. Include PageHeader, KpiStrip, FilterToolbar, DataRegion, and ContextPanel. Implement loading/empty/error/no-access states. Optimize for keyboard-first usage and high scan speed."

## Implementation Roadmap (Suggested)

1. Build 3 golden screens from Recipe 01, 03, and 05.
2. Extract reusable building blocks to shared components.
3. Add generation hints to AI instructions for recipe-first output.
4. Add visual QA checklist to verification prompts.
5. Expand recipes based on real module adoption.

## Success Criteria

This draft is working when:

- New module screens ship with stronger hierarchy and clearer flow on first generation.
- Teams spend less time redesigning AI-generated admin pages.
- Chakra-based outputs feel intentionally designed, not generic defaults.
- UX consistency improves across modules without reducing delivery speed.
