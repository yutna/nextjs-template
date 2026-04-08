# State 17: Saving Edit

Trigger: the user submits a valid detail edit and the server action is pending.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-detail-page]                                        |
| Edit operation OP-10482                     Saving changes...                       |
|------------------------------------------------------------------------------------|
| summary-strip [operations-detail-summary]                                          |
| Priority P1 | Owner Mali K. | SLA due 10:30 | Amount $12,480                       |
|------------------------------------------------------------------------------------|
| detail-body [operations-edit-form]                                                 |
| Fields remain visible but read-only while save is in progress.                     |
|------------------------------------------------------------------------------------|
| Actions: [Cancel disabled] [Save changes disabled]                                 |
| Side notes: server action pending, optimistic URL stays canonical                  |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations/OP-10482`
- Recipe: detail screen edit mode
- Components: disabled form state, save progress status
- Interactions: no duplicate submit
- Notes: maps to `SavingEdit`
