# State 22: Export Requested

Trigger: the user starts an export and the request is being prepared.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-data-grid-page-header]                             |
| Operations                               Export starting...  Density: compact       |
|------------------------------------------------------------------------------------|
| section-kpi-strip [operations-data-grid-kpis]                                      |
| Open 128 | SLA risk 17 | Escalated 9 | Export jobs 3                               |
|------------------------------------------------------------------------------------|
| toolbar-filter [operations-data-grid-toolbar]                                      |
| Search "urgent" | Status Open,Blocked | Sort Created desc | View Audit queue v2    |
|------------------------------------------------------------------------------------|
| table-data-region [operations-data-grid-table]                                     |
| The current filtered rows remain available while export prepares.                  |
|------------------------------------------------------------------------------------|
| drawer-context-panel [operations-data-grid-export-status]                          |
| Preparing CSV export for 128 matching operations...                                 |
| File name: operations-audit-queue-2026-04-08.csv                                   |
| [Dismiss disabled]                                                                  |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations`
- Recipe: `R01 Operations List + Bulk Actions`
- Components:
  `operations-data-grid-export-csv`, `operations-data-grid-export-status`
- Interactions: export initiation from header or toolbar menu
- Notes: first transition out of export idle
