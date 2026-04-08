# Phase 03: Views, Selection, and CSV

## Goal

Add user productivity features that build on the R01 list without changing the
route-ownership model.

## Priority

`@should`

## Included checklist items

- Column Resizing
- Show/Hide Columns
- Saved Filter Views
- Row Selection
- Keyboard Navigation
- CSV Export
- State Persistence (sort/filter/column widths in LocalStorage)

## Vertical slices

1. **Persisted list comfort state**
   - Persist widths, visibility, density, and non-canonical comfort choices in
     LocalStorage.
   - Keep shareable route state separate from purely local preferences.

2. **Saved-view workflow**
   - Save and restore named views.
   - Decide whether named views are local-first or server-backed.

3. **Selection and action readiness**
   - Add row selection and keyboard flow for bulk-action readiness.
   - Preserve native table semantics where possible.

4. **Early export**
   - Add synchronous CSV export for the current filtered dataset.

## Dependencies

- Phase 02 server list behavior
- Decision on saved-view persistence scope

## Validation focus

- Reloads restore persisted state correctly
- Keyboard interactions remain accessible
- CSV output respects active filters and masking rules
- Selection state does not break pagination or saved views

## Exit criteria

- Users can personalize, persist, and export the R01 list
- Bulk-edit prerequisites exist for the next phase
