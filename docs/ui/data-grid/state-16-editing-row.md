# State 16: Editing Row

Trigger: the user starts a row-based edit from the detail screen.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-detail-page]                                        |
| Edit operation OP-10482                     Status Open     Site BKK-2              |
|------------------------------------------------------------------------------------|
| summary-strip [operations-detail-summary]                                          |
| Priority P1 | Owner Mali K. | SLA due 10:30 | Amount $12,480                       |
|------------------------------------------------------------------------------------|
| detail-body [operations-edit-form]                                                 |
| Title *                   [ Supplier delay at BKK-2 warehouse                  ]    |
| Category *                [ Logistics                                         ]    |
| Owner *                   [ Mali K.                                           ]    |
| Resolution ETA            [ 2026-04-08 15:00                                  ]    |
| Notes                     [ Waiting on customs clearance update.               ]    |
|------------------------------------------------------------------------------------|
| Actions: [Cancel] [Save changes]                                                   |
| Side notes: required fields marked *, server validation on submit                  |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations/OP-10482`
- Recipe: detail screen edit mode
- Components:
  `operations-detail-edit`, `operations-edit-form`, `operations-edit-submit`
- Interactions: cancel, submit, field edits
- Notes: row-based editing before any in-cell editing
