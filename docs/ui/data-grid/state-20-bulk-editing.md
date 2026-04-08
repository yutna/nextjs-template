# State 20: Bulk Editing

Trigger: the user selects multiple rows and opens bulk edit.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-data-grid-page-header]                             |
| Operations                               3 rows selected     Density: compact       |
|------------------------------------------------------------------------------------|
| section-kpi-strip [operations-data-grid-kpis]                                      |
| Open 128 | SLA risk 17 | Escalated 9 | Export jobs 2                               |
|------------------------------------------------------------------------------------|
| toolbar-filter [operations-data-grid-toolbar]                                      |
| Search "urgent" | Status Open,Blocked | Sort Created desc                          |
|------------------------------------------------------------------------------------|
| bulk-action-bar [operations-data-grid-bulk-actions]                                |
| 3 selected | [Bulk edit] [Export selected] [Clear selection]                       |
|------------------------------------------------------------------------------------|
| table-data-region [operations-data-grid-table]                                     |
| [x] OP-10482   Open     P1   BKK-2  Mali K.      08 Apr 09:42  $12,480             |
| [x] OP-10477   Blocked  P1   CNX-1  Arun S.      08 Apr 09:18  $ 9,210             |
| [x] OP-10471   Open     P2   HKT-3  Nicha P.     08 Apr 08:50  $ 3,440             |
|------------------------------------------------------------------------------------|
| drawer-context-panel [operations-data-grid-bulk-edit-drawer]                       |
| Bulk edit 3 operations                                                             |
| Set owner: [ Regional Ops Queue                    ]                               |
| Set priority: [ P1                                  ]                              |
| Add note: [ Escalated due to supplier delay.         ]                             |
| [Cancel] [Apply bulk changes]                                                      |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations`
- Recipe: `R01 Operations List + Bulk Actions`
- Components: bulk action bar, bulk edit drawer
- Interactions: row selection, bulk edit, clear selection
- Notes: bulk action bar appears only when rows are selected
