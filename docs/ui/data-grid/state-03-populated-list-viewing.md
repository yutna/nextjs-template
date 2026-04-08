# State 03: Populated List Viewing

Trigger: the first page loads successfully and export is idle.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-data-grid-page-header]                             |
| Operations                               Audit queue v2        Density: compact     |
| Track high-volume operational work across sites and vendors.                       |
| Actions: [Refresh] [Export v] [New note]                                           |
|------------------------------------------------------------------------------------|
| section-kpi-strip [operations-data-grid-kpis]                                      |
| Open 128 | SLA risk 17 | Escalated 9 | Export jobs 2                               |
|------------------------------------------------------------------------------------|
| toolbar-filter [operations-data-grid-toolbar]                                      |
| Search "urgent" | Status Open,Blocked | Site BKK-2 | Sort Created desc             |
| View Audit queue v2 | Columns 7 visible | Reset | Save view | Density compact      |
|------------------------------------------------------------------------------------|
| table-data-region [operations-data-grid-table-region]                              |
| Sel ID         Status   Pri  Site   Owner        Updated       Amount     Detail    |
| [ ] OP-10482   Open     P1   BKK-2  Mali K.      08 Apr 09:42  $12,480    Open >   |
| [ ] OP-10477   Blocked  P1   CNX-1  Arun S.      08 Apr 09:18  $ 9,210    Open >   |
| [ ] OP-10471   Open     P2   HKT-3  Nicha P.     08 Apr 08:50  $ 3,440    Open >   |
| [ ] OP-10465   Review   P2   BKK-5  Somchai T.   08 Apr 08:07  $ 1,980    Open >   |
| [ ] OP-10458   Open     P3   KKC-2  Priya N.     08 Apr 07:44  $   820    Open >   |
|------------------------------------------------------------------------------------|
| 1-25 of 2,417 | Page 1 | Page size 25 | [Prev disabled] [Next]                    |
|------------------------------------------------------------------------------------|
| drawer-context-panel [operations-data-grid-drawer]                                 |
| Row preview: OP-10482                                                              |
| Supplier delay at BKK-2. Last comment 12m ago. Assignee Mali K. SLA due 10:30.    |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations`
- Recipe: `R01 Operations List + Bulk Actions`
- Components:
  `operations-data-grid-table`, `operations-data-grid-row-1`,
  `operations-data-grid-density`
- Interactions:
  `operations-data-grid-global-search`, `operations-data-grid-view-select`,
  `operations-data-grid-row-open-1`
- Notes: combined happy path for query ready, list viewing, and export idle
