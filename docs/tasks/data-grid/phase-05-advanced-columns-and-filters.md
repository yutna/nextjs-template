# Phase 05: Advanced Columns and Filters

## Goal

Add richer layout control and structured query composition for advanced users.

## Priority

`@should`

## Included checklist items

- Column Reordering
- Column Pinning (Frozen Columns)
- Stacked Headers (Column Grouping)
- Column-level Filters: set
- Advanced Filter Builder (AND/OR)
- Exposed API
- Event Hooks

## Vertical slices

1. **Advanced layout state**
   - Add reorder, pin, and grouped-header contracts.
   - Keep drag-and-drop client boundaries isolated.

2. **Structured query builder**
   - Support set filters and AND/OR filter composition.
   - Reconcile structured filters with URL and saved views.

3. **Host integration APIs**
   - Expose typed event hooks and limited imperative APIs for host modules.

## Dependencies

- Phase 03 saved views and persistence
- Phase 04 editing events if host integrations depend on them

## Validation focus

- Layout state round-trips cleanly through saved views
- Advanced filters serialize and deserialize predictably
- Host hooks remain typed and do not leak internal implementation details

## Exit criteria

- Power users can shape columns and structured filters without breaking route state
- Host modules have clear integration seams
