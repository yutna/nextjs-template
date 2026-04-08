# Data Grid Overview

## Summary

This task defines a reusable data grid foundation plus host-route integration rules.
It does not define a standalone route. Host resources own canonical URLs and
resource-specific queries, while the shared grid foundation provides rendering,
layout, interaction, and typed extension points.

## Recommended phasing

1. **Phase 01** establishes the shared foundation, host-route contract, and bounded
   client-side mode.
2. **Phase 02** delivers R01, the first enterprise operations list with compact
   density and server-side query behavior.
3. **Phase 03** adds persisted views, selection, keyboard flow, and early CSV export.
4. **Phase 04** adds canonical detail, row-based editing, validation, and bulk edit.
5. **Phase 05** adds advanced column management, richer filters, and host-facing APIs.
6. **Phase 06** adds grouping, tree data, office integration, and undo/redo.
7. **Phase 07** adds measured virtualization, spreadsheet-like interactions, pivot,
   and report-job scaling.

## MVP vs advanced scope

| Scope band | Included phases | Outcome |
|------------|-----------------|---------|
| MVP / first adopter | Phase 01 + Phase 02 | Reusable foundation plus R01 server-driven operations list |
| Expanded baseline | Phase 03 + Phase 04 | Persistent views, selection, CSV, detail, and row editing |
| Advanced enterprise | Phase 05 + Phase 06 + Phase 07 | Deep column features, grouping, tree, exports, virtualization, pivot, spreadsheet mode |

## Checklist-to-phase mapping

### 1. Core Data Handling

| Checklist item | Priority | Phase | Notes |
|----------------|----------|-------|-------|
| Client-side Pagination | @must | Phase 01 | Allowed only for small, bounded, already-loaded datasets |
| Server-side Pagination | @must | Phase 02 | Default for R01 and large datasets |
| Virtual Scrolling (Row Virtualization) | @could | Phase 07 | Add only after measured scale justifies it |
| Lazy Loading / Infinite Scroll | @could | Phase 07 | Optional alternate large-data mode |
| Data Masking | @must | Phase 02 | Enforced server-side with typed column display rules |

### 2. Column Management

| Checklist item | Priority | Phase | Notes |
|----------------|----------|-------|-------|
| Column Resizing | @should | Phase 03 | Pairs with persistence |
| Column Reordering | @should | Phase 05 | Requires drag client boundary |
| Column Pinning (Frozen Columns) | @should | Phase 05 | Depends on richer layout state |
| Show/Hide Columns | @should | Phase 03 | Shareable and persisted preference |
| Stacked Headers (Column Grouping) | @should | Phase 05 | Requires grouped column definitions |
| Column Virtualization | @could | Phase 07 | Follows row virtualization |

### 3. Sorting and Filtering

| Checklist item | Priority | Phase | Notes |
|----------------|----------|-------|-------|
| Multi-column Sorting | @must | Phase 02 | Server-side first |
| Global Search | @must | Phase 02 | URL-driven query state |
| Column-level Filters: text / number / date / set | @must / @should | Phase 02 + Phase 05 | Text, number, and date in Phase 02; set filters in Phase 05 |
| Advanced Filter Builder (AND/OR) | @should | Phase 05 | Requires structured query model |
| Saved Filter Views | @should | Phase 03 | Saved-view contract may be local-first or server-backed |

### 4. Editing and Validation

| Checklist item | Priority | Phase | Notes |
|----------------|----------|-------|-------|
| In-cell Editing | @could | Phase 07 | Deferred until spreadsheet mode is justified |
| Row-based Editing | @should | Phase 04 | Preferred MVP edit model |
| Data Validation | @should | Phase 04 | Server action plus field-level feedback |
| Bulk Editing | @should | Phase 04 | Depends on row selection |
| Undo / Redo | @should | Phase 06 | Added after edit history semantics are clear |

### 5. Selection and Interactivity

| Checklist item | Priority | Phase | Notes |
|----------------|----------|-------|-------|
| Row Selection | @should | Phase 03 | Supports bulk actions |
| Cell/Range Selection | @could | Phase 07 | Spreadsheet-like mode only |
| Context Menu | @should | Phase 06 | Add after action surface is clear |
| Keyboard Navigation | @should | Phase 03 | Native table first, ARIA grid later if needed |
| Master-Detail | @should | Phase 04 | Canonical detail route first, overlay optional by host |

### 6. Aggregation and Reporting

| Checklist item | Priority | Phase | Notes |
|----------------|----------|-------|-------|
| Row Grouping | @should | Phase 06 | Server contracts required |
| Aggregation (sum/avg/min/max/count) | @should | Phase 06 | Paired with grouped queries |
| Pivot Mode | @could | Phase 07 | Advanced analytical mode |
| Tree Data Support | @should | Phase 06 | Distinct row hierarchy contract |

### 7. Export and Integration

| Checklist item | Priority | Phase | Notes |
|----------------|----------|-------|-------|
| Excel Export | @should | Phase 06 | Later than CSV |
| CSV Export | @should | Phase 03 | Early synchronous export |
| PDF Export | @could | Phase 07 | Treat as report generation |
| Clipboard Support | @should | Phase 06 | Requires clear selection semantics |

### 8. UX, UI, and Accessibility

| Checklist item | Priority | Phase | Notes |
|----------------|----------|-------|-------|
| Responsive Design | @must | Phase 01 | Baseline requirement |
| Theming and Dark Mode | @must | Phase 01 | Chakra theme compatibility |
| Localization (i18n) | @must | Phase 01 | `en` and `th` |
| Accessibility (WCAG 2.1) | @must | Phase 01 | Native table baseline |
| State Persistence (sort/filter/column widths in LocalStorage) | @should | Phase 03 | Shareable URL plus local comfort state |

### 9. Developer Experience

| Checklist item | Priority | Phase | Notes |
|----------------|----------|-------|-------|
| Strongly Typed props/events/models | @must | Phase 01 | Shared contract foundation |
| Custom Cell Renderers | @must | Phase 01 | Host-extensible renderer model |
| Exposed API | @should | Phase 05 | Host-level imperative helpers only where justified |
| Event Hooks | @should | Phase 05 | Typed callbacks for host integration |
| Headless Support | @must | Phase 01 | Shared behavior without forcing one visual shell |

## Recommended validation strategy by phase

- **Phase 01:** focus on route ownership rules, responsive table semantics, locale
  coverage, and typed contracts.
- **Phase 02:** focus on shareable URL state, server query correctness, masking, and
  loading/empty/error states.
- **Phase 03:** focus on persistence, selection, keyboard flow, and CSV parity.
- **Phase 04:** focus on canonical detail routing, validation, and safe mutation flow.
- **Phase 05:** focus on advanced layout state and minimal client boundaries.
- **Phase 06:** focus on grouped query correctness, clipboard safety, and export shape.
- **Phase 07:** focus on measured performance thresholds, ARIA grid justification, and
  background-job reliability.

## Audit note

All 44 issue checklist items are mapped above. Coverage is complete and intended to
stay auditable throughout implementation.
