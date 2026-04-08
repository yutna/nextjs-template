# State 09: Default View

Trigger: the list is showing the baseline layout with no unsaved changes.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-data-grid-page-header]                             |
| Operations                               View: Default        Density: compact      |
|------------------------------------------------------------------------------------|
| section-kpi-strip [operations-data-grid-kpis]                                      |
| Open 128 | SLA risk 17 | Escalated 9 | Export jobs 2                               |
|------------------------------------------------------------------------------------|
| toolbar-filter [operations-data-grid-toolbar]                                      |
| Search "" | Status Open | Sort Created desc | View Default                         |
| Columns 7 visible | No unsaved changes | [Reset disabled] [Save view disabled]     |
|------------------------------------------------------------------------------------|
| table-data-region [operations-data-grid-table]                                     |
| Sel ID         Status   Pri  Site   Owner        Updated       Amount               |
| [ ] OP-10482   Open     P1   BKK-2  Mali K.      08 Apr 09:42  $12,480              |
| [ ] OP-10477   Blocked  P1   CNX-1  Arun S.      08 Apr 09:18  $ 9,210              |
|------------------------------------------------------------------------------------|
| drawer-context-panel [operations-data-grid-drawer]                                 |
| Default view notes: compact density, status first, amount visible.                 |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations?view=default`
- Recipe: `R01 Operations List + Bulk Actions`
- Components: `operations-data-grid-view-select`, default state badges
- Interactions: resize, visibility, and density changes transition to dirty view
- Notes: saved view workflow begins here
