# Data Grid UI Wireframes

## Feature summary

These wireframes describe the server-first `operations` host implementation for the
reusable data grid foundation. The primary surface is the compact-density enterprise
operations list, with canonical detail routes, saved views, bulk actions, and export
status patterns.

## Primary recipe

- Primary recipe: `R01 Operations List + Bulk Actions`
- Density: `compact`
- URL state source of truth: `nuqs` on host routes
- Canonical list route: `/[locale]/(private)/operations`
- Canonical detail route: `/[locale]/(private)/operations/[id]`

## Route map

- List: `/[locale]/(private)/operations`
- List with query state:
  `/[locale]/(private)/operations?page=1&pageSize=25&sort=createdAt.desc&density=compact`
- Detail: `/[locale]/(private)/operations/[id]`
- Optional overlay implementation (App Router):
  - File structure: `src/app/[locale]/(private)/operations/@panel/(.)[id]/page.tsx`
  - Fallback: `src/app/[locale]/(private)/operations/@panel/default.tsx`
  - Canonical URL preserved: `/[locale]/(private)/operations/[id]`

## Region inventory

- `section-page-header`
- `section-kpi-strip`
- `toolbar-filter`
- `table-data-region`
- `drawer-context-panel`
- Conditional bulk action bar when rows are selected
- Canonical detail body for `/operations/[id]`

## State inventory

- [state-01-resolving-route-state.md](./state-01-resolving-route-state.md)
- [state-02-loading.md](./state-02-loading.md)
- [state-03-populated-list-viewing.md](./state-03-populated-list-viewing.md)
- [state-04-empty.md](./state-04-empty.md)
- [state-05-error.md](./state-05-error.md)
- [state-06-permission-denied.md](./state-06-permission-denied.md)
- [state-07-appending.md](./state-07-appending.md)
- [state-08-exhausted.md](./state-08-exhausted.md)
- [state-09-default-view.md](./state-09-default-view.md)
- [state-10-dirty-view.md](./state-10-dirty-view.md)
- [state-11-saving-view.md](./state-11-saving-view.md)
- [state-12-saved-view.md](./state-12-saved-view.md)
- [state-13-applying-view.md](./state-13-applying-view.md)
- [state-14-view-error.md](./state-14-view-error.md)
- [state-15-detail-viewing.md](./state-15-detail-viewing.md)
- [state-16-editing-row.md](./state-16-editing-row.md)
- [state-17-saving-edit.md](./state-17-saving-edit.md)
- [state-18-validation-error.md](./state-18-validation-error.md)
- [state-19-conflict.md](./state-19-conflict.md)
- [state-20-bulk-editing.md](./state-20-bulk-editing.md)
- [state-21-saving-bulk-edit.md](./state-21-saving-bulk-edit.md)
- [state-22-export-requested.md](./state-22-export-requested.md)
- [state-23-export-ready.md](./state-23-export-ready.md)
- [state-24-export-queued.md](./state-24-export-queued.md)
- [state-25-export-error.md](./state-25-export-error.md)

## Flow documents

- [flow-01-list-query-lifecycle.md](./flow-01-list-query-lifecycle.md)
- [flow-02-view-customization.md](./flow-02-view-customization.md)
- [flow-03-detail-and-editing.md](./flow-03-detail-and-editing.md)
- [flow-04-export-lifecycle.md](./flow-04-export-lifecycle.md)
- [flow-05-advanced-scale-and-spreadsheet.md](./flow-05-advanced-scale-and-spreadsheet.md)

## Optional overlay note

The detail overlay pattern is optional only. The default planning baseline remains the
canonical full-page detail route. If a host later adopts an intercepting detail panel,
the route must preserve the canonical detail URL contract and ship with
`@panel/default.tsx`.
