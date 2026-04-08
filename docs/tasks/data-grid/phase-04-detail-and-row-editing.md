# Phase 04: Detail and Row Editing

## Goal

Add canonical detail and row-based editing before any spreadsheet-style editing.

## Priority

`@should`

## Included checklist items

- Row-based Editing
- Data Validation
- Bulk Editing
- Master-Detail

## Vertical slices

1. **Canonical detail routing**
   - Implement host-owned detail routes.
   - Add an overlay recipe only for hosts that truly need context-preserving detail.

2. **Row-based edit flow**
   - Use server actions for detail edits.
   - Keep validation and conflict handling explicit.

3. **Bulk edit flow**
   - Use row selection from Phase 03 to stage safe batch updates.
   - Keep auditability and error reporting clear.

## Dependencies

- Phase 03 row selection
- Resource-specific server actions and validation rules

## Validation focus

- Detail routes work on hard navigation and refresh
- Validation errors and stale-write conflicts are explicit
- Bulk edits report partial or full failure honestly

## Exit criteria

- Host modules can view, edit, and bulk edit records through canonical routes
- Spreadsheet-style editing is still intentionally deferred
