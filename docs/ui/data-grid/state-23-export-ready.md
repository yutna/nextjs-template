# State 23: Export Ready

Trigger: a synchronous export completes successfully.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-data-grid-page-header]                             |
| Operations                               Export complete     Density: compact       |
|------------------------------------------------------------------------------------|
| section-kpi-strip [operations-data-grid-kpis]                                      |
| Open 128 | SLA risk 17 | Escalated 9 | Export jobs 3                               |
|------------------------------------------------------------------------------------|
| toolbar-filter [operations-data-grid-toolbar]                                      |
| Search "urgent" | Status Open,Blocked | Sort Created desc | View Audit queue v2    |
|------------------------------------------------------------------------------------|
| table-data-region [operations-data-grid-table]                                     |
| Rows remain unchanged. The user can continue browsing immediately.                 |
|------------------------------------------------------------------------------------|
| drawer-context-panel [operations-data-grid-export-status]                          |
| CSV ready. Download started: operations-audit-queue-2026-04-08.csv                 |
| Included rows: 128 | Masking policy: applied                                       |
| [Download again] [Close]                                                           |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations`
- Recipe: `R01 Operations List + Bulk Actions`
- Components: export success drawer and status region
- Interactions: re-download, close, continue filtering
- Notes: synchronous completion path
