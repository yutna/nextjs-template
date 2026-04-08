# State 07: Appending

Trigger: infinite mode requests the next slice after the first page is ready.

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
| ... rows 1-50 already rendered ...                                                 |
| [ ] OP-10401   Open     P2   BKK-7  Thida R.     07 Apr 17:14  $ 1,330    Open >   |
| [ ] OP-10397   Review   P3   HKT-1  Kiet V.      07 Apr 16:58  $   640    Open >   |
| [ load more sentinel ] [operations-data-grid-load-more-sentinel]                   |
| Appending next slice... rows 51-75 incoming                                         |
|------------------------------------------------------------------------------------|
| drawer-context-panel [operations-data-grid-drawer]                                 |
| Append status: preserving current rows while fetching more.                        |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations?mode=infinite`
- Recipe: `R01 Operations List + Bulk Actions`
- Components: table region, load-more sentinel, append status
- Interactions: scrolling triggers append; toolbar remains available
- Notes: optional late-phase large-data mode
