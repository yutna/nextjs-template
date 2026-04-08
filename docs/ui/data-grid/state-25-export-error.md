# State 25: Export Error

Trigger: a synchronous or queued export request fails.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-data-grid-page-header]                             |
| Operations                               Export failed       Density: compact       |
|------------------------------------------------------------------------------------|
| section-kpi-strip [operations-data-grid-kpis]                                      |
| Open 128 | SLA risk 17 | Escalated 9 | Export jobs 4                               |
|------------------------------------------------------------------------------------|
| toolbar-filter [operations-data-grid-toolbar]                                      |
| Search "" | Status All | Sort Created desc | View Default                          |
|------------------------------------------------------------------------------------|
| table-data-region [operations-data-grid-table]                                     |
| Row browsing continues. Only the export workflow failed.                           |
|------------------------------------------------------------------------------------|
| drawer-context-panel [operations-data-grid-export-status]                          |
| Export failed for format pdf.                                                       |
| Reason: report job service unavailable.                                             |
| Request ID: exp_7f0c1a2d                                                            |
| [Retry export] [Switch to CSV] [Dismiss]                                           |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations`
- Recipe: `R01 Operations List + Bulk Actions`
- Components: export error drawer and retry actions
- Interactions: retry export, downgrade format, dismiss
- Notes: distinct from `state-05-error.md`, which is list query failure
