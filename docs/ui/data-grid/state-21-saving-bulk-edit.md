# State 21: Saving Bulk Edit

Trigger: the user submits valid bulk changes for selected rows.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-data-grid-page-header]                             |
| Operations                               Applying bulk changes...                   |
|------------------------------------------------------------------------------------|
| section-kpi-strip [operations-data-grid-kpis]                                      |
| Open 128 | SLA risk 17 | Escalated 9 | Export jobs 2                               |
|------------------------------------------------------------------------------------|
| toolbar-filter [operations-data-grid-toolbar]                                      |
| Search "urgent" | Status Open,Blocked | Sort Created desc                          |
|------------------------------------------------------------------------------------|
| bulk-action-bar [operations-data-grid-bulk-actions]                                |
| 3 selected | Bulk save in progress | controls disabled                             |
|------------------------------------------------------------------------------------|
| table-data-region [operations-data-grid-table]                                     |
| Selected rows stay visible while the server action runs.                           |
|------------------------------------------------------------------------------------|
| drawer-context-panel [operations-data-grid-bulk-edit-drawer]                       |
| Applying owner="Regional Ops Queue", priority="P1" to 3 operations...              |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations`
- Recipe: `R01 Operations List + Bulk Actions`
- Components: disabled bulk action bar, saving drawer
- Interactions: no duplicate submit while save is pending
- Notes: success returns to list viewing; invalid input returns to validation error
