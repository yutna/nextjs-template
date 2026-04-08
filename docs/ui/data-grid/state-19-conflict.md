# State 19: Conflict

Trigger: a stale write is detected while saving a row edit.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-detail-page]                                        |
| Edit operation OP-10482                     Update conflict detected                |
|------------------------------------------------------------------------------------|
| conflict-banner [operations-detail-conflict]                                       |
| Another user updated this record at 09:47. Reload the latest row before saving.    |
|------------------------------------------------------------------------------------|
| detail-body [operations-edit-form]                                                 |
| Your pending value            Latest server value                                   |
| Owner: Mali K.               Owner: Arun S.                                         |
| Notes: customs pending       Notes: vendor confirmed release at 11:00               |
|------------------------------------------------------------------------------------|
| Actions: [Reload latest row] [Keep editing]                                         |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations/OP-10482`
- Recipe: detail screen conflict state
- Components: conflict banner, compare values, reload action
- Interactions: reload latest row and continue editing
- Notes: explicit stale-write recovery
