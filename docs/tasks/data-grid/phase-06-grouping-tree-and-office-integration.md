# Phase 06: Grouping, Tree, and Office Integration

## Goal

Add analytical grouping and deeper integration after the core list and edit workflows
are stable.

## Priority

`@should`

## Included checklist items

- Row Grouping
- Aggregation (sum/avg/min/max/count)
- Tree Data Support
- Excel Export
- Clipboard Support
- Context Menu
- Undo / Redo

## Vertical slices

1. **Grouped and aggregated list**
   - Add grouped server query contracts and aggregate display.

2. **Tree data**
   - Support hierarchical rows with clear expand and collapse semantics.

3. **Office workflows**
   - Add Excel export and clipboard support.
   - Add context-menu actions where they improve discoverability.

4. **Edit history**
   - Add undo and redo semantics only after edit scopes are well defined.

## Dependencies

- Phase 04 editing flows
- Phase 05 event hooks and advanced layout state

## Validation focus

- Grouped totals match server data
- Clipboard and export flows respect masking and permissions
- Context menus remain keyboard reachable
- Undo and redo boundaries are predictable

## Exit criteria

- Analytical and office-oriented workflows are available without forcing spreadsheet
  mode on all hosts
