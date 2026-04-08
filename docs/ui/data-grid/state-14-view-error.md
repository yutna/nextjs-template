# State 14: View Error

Trigger: saving or applying a view fails.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-data-grid-page-header]                             |
| Operations                               View action failed  Density: compact       |
|------------------------------------------------------------------------------------|
| section-kpi-strip [operations-data-grid-kpis]                                      |
| Open 128 | SLA risk 17 | Escalated 9 | Export jobs 2                               |
|------------------------------------------------------------------------------------|
| toolbar-filter [operations-data-grid-toolbar]                                      |
| Search "" | Status Open | Sort Created desc | View Default *dirty*                 |
|------------------------------------------------------------------------------------|
| table-data-region [operations-data-grid-table]                                     |
| Existing rows remain visible. Last good layout is preserved.                       |
|------------------------------------------------------------------------------------|
| drawer-context-panel [operations-data-grid-drawer]                                 |
| Could not save "My compact view".                                                  |
| Reason: duplicate name for this user.                                              |
| [Retry save] [Rename view] [Dismiss]                                               |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations`
- Recipe: `R01 Operations List + Bulk Actions`
- Components: inline view error, retry and rename actions
- Interactions: retry save, rename, dismiss without losing current layout
- Notes: distinct from list query error
