# State 12: Saved View

Trigger: the named view save succeeds and becomes selectable.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-data-grid-page-header]                             |
| Operations                               View: My compact view Density: compact     |
|------------------------------------------------------------------------------------|
| section-kpi-strip [operations-data-grid-kpis]                                      |
| Open 128 | SLA risk 17 | Escalated 9 | Export jobs 2                               |
|------------------------------------------------------------------------------------|
| toolbar-filter [operations-data-grid-toolbar]                                      |
| Search "" | Status Open | Sort Created desc | View My compact view                 |
| Saved just now | [Reset disabled] [Save view disabled]                             |
|------------------------------------------------------------------------------------|
| table-data-region [operations-data-grid-table]                                     |
| Layout matches the saved preferences.                                              |
|------------------------------------------------------------------------------------|
| drawer-context-panel [operations-data-grid-drawer]                                 |
| Success: "My compact view" is available in the view selector.                      |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations?view=my-compact-view`
- Recipe: `R01 Operations List + Bulk Actions`
- Components: `operations-data-grid-view-select`, saved confirmation
- Interactions: user may reapply, edit, or export from the saved view
- Notes: success feedback should not interrupt browsing
