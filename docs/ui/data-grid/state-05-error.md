# State 05: Error

Trigger: the list query fails during initial load or refresh.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-data-grid-page-header]                             |
| Operations                               Data unavailable      Density: compact     |
|------------------------------------------------------------------------------------|
| section-kpi-strip [operations-data-grid-kpis]                                      |
| Open -- | SLA risk -- | Escalated -- | Export jobs 2                               |
|------------------------------------------------------------------------------------|
| toolbar-filter [operations-data-grid-toolbar]                                      |
| Search "urgent" | Status Open,Blocked | Sort Created desc | View Audit queue v2    |
|------------------------------------------------------------------------------------|
| table-data-region [operations-data-grid-error]                                     |
| We could not load operations right now.                                             |
| Request ID: req_ops_9b3417                                                          |
| Last attempted query: page=1 pageSize=25 sort=createdAt.desc search=urgent         |
| [Retry] [Copy diagnostics]                                                          |
|------------------------------------------------------------------------------------|
| drawer-context-panel [operations-data-grid-drawer]                                 |
| Error details for support. Retry keeps the same URL state.                         |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations`
- Recipe: `R01 Operations List + Bulk Actions`
- Components: `operations-data-grid-error`, `operations-data-grid-retry`
- Interactions: retry, copy diagnostics, keep current filters intact
- Notes: this is query-load error; export failures use `state-25-export-error.md`
