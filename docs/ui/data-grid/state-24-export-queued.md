# State 24: Export Queued

Trigger: the export exceeds synchronous limits and a background job is queued.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-data-grid-page-header]                             |
| Operations                               Export queued       Density: compact       |
|------------------------------------------------------------------------------------|
| section-kpi-strip [operations-data-grid-kpis]                                      |
| Open 128 | SLA risk 17 | Escalated 9 | Export jobs 4                               |
|------------------------------------------------------------------------------------|
| toolbar-filter [operations-data-grid-toolbar]                                      |
| Search "" | Status All | Sort Created desc | View Default                          |
|------------------------------------------------------------------------------------|
| table-data-region [operations-data-grid-table]                                     |
| Current list remains interactive while the background export runs.                 |
|------------------------------------------------------------------------------------|
| drawer-context-panel [operations-data-grid-export-status]                          |
| XLSX export queued.                                                                 |
| Job ID: rep_01HTW7K9Z8E3A6                                                          |
| Scope: 2,417 rows | Format: xlsx | Delivery: notify in app + email                |
| [View job status] [Queue PDF instead]                                              |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations`
- Recipe: `R01 Operations List + Bulk Actions`
- Components:
  `operations-data-grid-export-xlsx`, `operations-data-grid-export-status`
- Interactions: view queued job status, continue working in the list
- Notes: late-phase report-job language reused for large exports
