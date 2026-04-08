# State 08: Exhausted

Trigger: infinite mode reaches the end of the dataset.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-data-grid-page-header]                             |
| Operations                               Infinite mode on     Density: compact      |
|------------------------------------------------------------------------------------|
| section-kpi-strip [operations-data-grid-kpis]                                      |
| Open 128 | SLA risk 17 | Escalated 9 | Export jobs 2                               |
|------------------------------------------------------------------------------------|
| toolbar-filter [operations-data-grid-toolbar]                                      |
| Search "" | Status All | Sort Created desc | Mode infinite                         |
|------------------------------------------------------------------------------------|
| table-data-region [operations-data-grid-table-region]                              |
| ... rows 2,393-2,417 rendered ...                                                  |
| [ ] OP-08019   Closed   P3   BKK-4  Natt P.      01 Mar 10:24  $   280    Open >   |
| [ ] OP-08011   Closed   P3   CNX-2  Yada S.      01 Mar 09:52  $   190    Open >   |
| All 2,417 rows loaded. No more results.                                             |
|------------------------------------------------------------------------------------|
| drawer-context-panel [operations-data-grid-drawer]                                 |
| Exhausted state reached. Query changes will reset the list and fetch from top.     |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations?mode=infinite`
- Recipe: `R01 Operations List + Bulk Actions`
- Components: table end marker, exhausted message, drawer guidance
- Interactions: changing filters or sort restarts loading
- Notes: maps to `Exhausted`
