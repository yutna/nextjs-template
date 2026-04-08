# State 02: Loading

Trigger: route state resolved and the server query is in flight.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-data-grid-page-header]                             |
| Operations                               Audit queue v2        Density: compact     |
| Track high-volume operational work across sites and vendors.                       |
|------------------------------------------------------------------------------------|
| section-kpi-strip [operations-data-grid-kpis]                                      |
| Open [....] | SLA risk [....] | Escalated [....] | Export jobs [....]             |
|------------------------------------------------------------------------------------|
| toolbar-filter [operations-data-grid-toolbar]                                      |
| Search "urgent" | Status Open, Blocked | Owner Any | Sort Created desc             |
| Columns 7 visible | View Audit queue v2 | Reset | Save view                        |
|------------------------------------------------------------------------------------|
| table-data-region [operations-data-grid-loading]                                   |
| Sel  ID         Status     Priority   Site        Owner      Updated     Amount    |
| [ shimmer row                                                             ]        |
| [ shimmer row                                                             ]        |
| [ shimmer row                                                             ]        |
|------------------------------------------------------------------------------------|
| drawer-context-panel [operations-data-grid-drawer]                                 |
| Loading current slice... page 1 of ?                                               |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route:
  `/[locale]/(private)/operations?page=1&pageSize=25&sort=createdAt.desc&density=compact`
- Recipe: `R01 Operations List + Bulk Actions`
- Components: loading table, KPI skeletons, drawer status
- Interactions: query controls are visible but temporarily busy
- Notes: aligns with `LoadingPage`
