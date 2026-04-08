# State 01: Resolving Route State

Trigger: user opens `/[locale]/(private)/operations` with URL query parameters.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| Sidebar: Dashboard / Operations / Reports / Settings                              |
|------------------------------------------------------------------------------------|
| section-page-header [operations-data-grid-page-header]                             |
| Operations                                 View: parsing URL...   Density: compact |
| Shared route state is resolving before the first server query.                     |
|------------------------------------------------------------------------------------|
| section-kpi-strip [operations-data-grid-kpis]                                      |
| [----] Open  [----] SLA risk  [----] Escalated  [----] Export jobs                |
|------------------------------------------------------------------------------------|
| toolbar-filter [operations-data-grid-toolbar]                                      |
| page=2 | pageSize=25 | sort=createdAt.desc | search=urgent | status=open,blocked  |
| view=audit-queue | visible-columns=id,status,owner,amount | nuqs route parse       |
|------------------------------------------------------------------------------------|
| table-data-region [operations-data-grid-loading]                                   |
| [ skeleton row ]                                                                   |
| [ skeleton row ]                                                                   |
| [ skeleton row ]                                                                   |
|------------------------------------------------------------------------------------|
| drawer-context-panel [operations-data-grid-drawer]                                 |
| Resolving query schema, permissions, and saved view compatibility.                 |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations?...`
- Recipe: `R01 Operations List + Bulk Actions`
- Components:
  `operations-data-grid-page-header`, `operations-data-grid-toolbar`,
  `operations-data-grid-loading`
- Interactions: no direct interaction until route parse completes
- Notes: URL is the source of truth; this state is server-first
