# State 11: Saving View

Trigger: the user submits a named view save from a dirty layout.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-data-grid-page-header]                             |
| Operations                               Saving named view...  Density: compact     |
|------------------------------------------------------------------------------------|
| section-kpi-strip [operations-data-grid-kpis]                                      |
| Open 128 | SLA risk 17 | Escalated 9 | Export jobs 2                               |
|------------------------------------------------------------------------------------|
| toolbar-filter [operations-data-grid-toolbar]                                      |
| Search "" | Status Open | Sort Created desc | View Default *dirty*                 |
|------------------------------------------------------------------------------------|
| table-data-region [operations-data-grid-table]                                     |
| Existing rows stay visible while the save request runs.                            |
|------------------------------------------------------------------------------------|
| drawer-context-panel [operations-data-grid-save-view-dialog]                       |
| Save view                                                                          |
| Name: [ My compact view                         ]                                  |
| Includes: filters, visible columns, widths, density                               |
| Status: saving...                                                                  |
| [Cancel disabled] [Save disabled]                                                  |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations`
- Recipe: `R01 Operations List + Bulk Actions`
- Components:
  `operations-data-grid-save-view`, `operations-data-grid-view-name`,
  `operations-data-grid-save-view-submit`
- Interactions: save in progress; background list remains stable
- Notes: drawer pattern keeps the full page visible
