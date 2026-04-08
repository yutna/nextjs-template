# State 04: Empty

Trigger: the server returns zero rows for the current query.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-data-grid-page-header]                             |
| Operations                               No matching records    Density: compact    |
|------------------------------------------------------------------------------------|
| section-kpi-strip [operations-data-grid-kpis]                                      |
| Open 0 | SLA risk 0 | Escalated 0 | Export jobs 0                                  |
|------------------------------------------------------------------------------------|
| toolbar-filter [operations-data-grid-toolbar]                                      |
| Search "no-matching-record" | Status Closed | Site Any | Sort Created desc         |
| View Default | Clear filters | Save view disabled                                  |
|------------------------------------------------------------------------------------|
| table-data-region [operations-data-grid-empty]                                     |
| No operations match this filter set.                                               |
| Try clearing search, changing status filters, or switching to the default view.    |
| [Clear filters] [Reset view]                                                       |
|------------------------------------------------------------------------------------|
| drawer-context-panel [operations-data-grid-drawer]                                 |
| Empty result guidance: recent searches, saved views, and query tips.               |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations?search=no-matching-record`
- Recipe: `R01 Operations List + Bulk Actions`
- Components: `operations-data-grid-empty`, toolbar filter reset actions
- Interactions: clear filters, reset view, edit URL query directly
- Notes: row controls and bulk actions are absent
