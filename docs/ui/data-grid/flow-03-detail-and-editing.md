# Flow 03: Detail and Editing

## Flow diagram

```text
ListViewing --> DetailViewing --> EditingRow --> SavingEdit --> DetailViewing
      |              |                |              |
      |              |                |              +--> Conflict --> EditingRow
      |              |                |
      |              |                +--> ValidationError --> EditingRow
      |              |
      +----------> BulkEditing --> SavingBulkEdit --> ListViewing
                                       |
                                       +--> ValidationError
```

## Relevant wireframes

- [Populated list viewing](./state-03-populated-list-viewing.md)
- [Detail viewing](./state-15-detail-viewing.md)
- [Editing row](./state-16-editing-row.md)
- [Saving edit](./state-17-saving-edit.md)
- [Validation error](./state-18-validation-error.md)
- [Conflict](./state-19-conflict.md)
- [Bulk editing](./state-20-bulk-editing.md)
- [Saving bulk edit](./state-21-saving-bulk-edit.md)

## Transition notes

- Canonical navigation from the list opens `/[locale]/(private)/operations/[id]`.
- Optional detail overlay remains a future host choice and is not required for the
  baseline.
- Edits are row-based and server-action backed; spreadsheet-style in-cell editing is
  intentionally deferred to the advanced flow.
