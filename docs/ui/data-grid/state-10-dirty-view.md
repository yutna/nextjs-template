# State 10: Dirty View

Trigger: the user changes layout state such as width, visibility, or density.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-data-grid-page-header]                             |
| Operations                               View: Default *dirty* Density: compact     |
|------------------------------------------------------------------------------------|
| section-kpi-strip [operations-data-grid-kpis]                                      |
| Open 128 | SLA risk 17 | Escalated 9 | Export jobs 2                               |
|------------------------------------------------------------------------------------|
| toolbar-filter [operations-data-grid-toolbar]                                      |
| Search "" | Status Open | Sort Created desc | View Default                         |
| Columns 6 visible | Width Status=156px | Dirty layout | [Reset view] [Save view]   |
|------------------------------------------------------------------------------------|
| table-data-region [operations-data-grid-table]                                     |
| Sel ID         Status         Site   Owner        Updated       Amount              |
| [ ] OP-10482   Open / SLA 2h  BKK-2  Mali K.      08 Apr 09:42  $12,480             |
| [ ] OP-10477   Blocked / P1   CNX-1  Arun S.      08 Apr 09:18  $ 9,210             |
|------------------------------------------------------------------------------------|
| drawer-context-panel [operations-data-grid-drawer]                                 |
| Unsaved changes: hidden Priority column, resized Status column.                    |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations?view=default&density=compact`
- Recipe: `R01 Operations List + Bulk Actions`
- Components: `operations-data-grid-view-dirty`, save and reset controls
- Interactions:
  `operations-data-grid-column-visibility-toggle`,
  `operations-data-grid-column-resize-handle-status`
- Notes: shareable query stays intact while comfort state becomes dirty
