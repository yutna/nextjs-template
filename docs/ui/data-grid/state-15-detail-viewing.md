# State 15: Detail Viewing

Trigger: the user opens a row from the list and lands on the canonical detail route.

## Wireframe

```text
+------------------------------------------------------------------------------------+
| AppShell (private)                                        EN | Dana Ops | Help     |
+------------------------------------------------------------------------------------+
| section-page-header [operations-detail-page]                                        |
| Operation OP-10482                           Status Open     Site BKK-2             |
| Supplier delay at BKK-2 warehouse                                        [Edit]    |
| Breadcrumbs: Operations / OP-10482                                                |
|------------------------------------------------------------------------------------|
| summary-strip [operations-detail-summary]                                          |
| Priority P1 | Owner Mali K. | SLA due 10:30 | Amount $12,480 | Last update 09:42   |
|------------------------------------------------------------------------------------|
| detail-body [operations-detail-layout]                                             |
| Main column                                                                        |
| - Description: Vendor shipment delayed due to customs hold.                        |
| - Category: Logistics                                                              |
| - Impact: Receiving backlog on line 3                                              |
| - Latest note: "Escalated to regional vendor manager."                             |
| Side column                                                                        |
| - Related records: OP-10477, OP-10398                                              |
| - Audit trail: 7 events                                                            |
| - Export status: idle                                                               |
+------------------------------------------------------------------------------------+
```

## Annotations

- Route: `/[locale]/(private)/operations/OP-10482`
- Recipe: detail borrows `R02` anatomy; overall feature still declares `R01`
- Components: `operations-detail-page`, `operations-detail-edit`
- Interactions: edit, navigate back to list, refresh detail
- Notes: full-page canonical detail, not an isolated modal
