# State 13: Applying View

Trigger: the user selects an existing saved view and the list is reloading.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-data-grid-page-header]                             |
| Operations                               Applying audit view... Density: compact    |
|------------------------------------------------------------------------------------|
| section-kpi-strip [operations-data-grid-kpis]                                      |
| Open [..] | SLA risk [..] | Escalated [..] | Export jobs [..]                      |
|------------------------------------------------------------------------------------|
| toolbar-filter [operations-data-grid-toolbar]                                      |
| Search "supplier" | Status Blocked | Sort Amount desc | View Audit queue v2        |
| [Busy] URL updating and re-querying the server                                      |
|------------------------------------------------------------------------------------|
| table-data-region [operations-data-grid-loading]                                   |
| Previous rows fade while the new saved view resolves.                              |
|------------------------------------------------------------------------------------|
| drawer-context-panel [operations-data-grid-drawer]                                 |
| Applying saved columns, filters, and widths.                                       |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations?view=audit-queue-v2`
- Recipe: `R01 Operations List + Bulk Actions`
- Components: view select busy state, loading table region
- Interactions: list is busy; retry is unnecessary unless the apply fails
- Notes: maps to `ApplyingView`
