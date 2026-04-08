# State 06: Permission Denied

Trigger: the user lacks permission to view operations data or masked content.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-data-grid-page-header]                             |
| Operations                               Access restricted    Density: compact      |
|------------------------------------------------------------------------------------|
| section-kpi-strip [operations-data-grid-kpis]                                      |
| Open -- | SLA risk -- | Escalated -- | Export jobs --                              |
|------------------------------------------------------------------------------------|
| toolbar-filter [operations-data-grid-toolbar]                                      |
| Query state preserved in URL but data is hidden for this role.                     |
|------------------------------------------------------------------------------------|
| table-data-region [operations-data-grid-permission-denied]                         |
| You do not have access to this operations dataset.                                 |
| Contact an administrator if you need the Operations Analyst or Auditor role.       |
| [Back to dashboard] [Request access]                                               |
|------------------------------------------------------------------------------------|
| drawer-context-panel [operations-data-grid-drawer]                                 |
| Policy note: masking and authorization are enforced server-side.                   |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations`
- Recipe: `R01 Operations List + Bulk Actions`
- Components: permission-denied state, policy note drawer
- Interactions: navigate away or request access
- Notes: server-first guard before row render
