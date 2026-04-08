# State 18: Validation Error

Trigger: the user submits invalid row or bulk edit input.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-detail-page]                                        |
| Edit operation OP-10482                     Fix validation errors                   |
|------------------------------------------------------------------------------------|
| validation-summary [operations-edit-validation-summary]                             |
| 2 fields need attention: Title is required. Owner must be an active user.          |
|------------------------------------------------------------------------------------|
| detail-body [operations-edit-form]                                                 |
| Title *                   [                                                    ]    |
|   Error: Title is required.                                                        |
| Category *                [ Logistics                                         ]    |
| Owner *                   [ Former User                                       ]    |
|   Error: Select an active owner.                                                   |
| Notes                     [ Waiting on customs clearance update.               ]    |
|------------------------------------------------------------------------------------|
| Actions: [Cancel] [Save changes]                                                   |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations/OP-10482`
- Recipe: detail screen edit mode
- Components:
  `operations-edit-validation-summary`, `operations-edit-form`,
  `operations-edit-required-field`
- Interactions: correct fields and resubmit
- Notes: form remains open after failure
