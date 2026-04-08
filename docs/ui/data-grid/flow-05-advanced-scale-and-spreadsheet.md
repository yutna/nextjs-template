# Flow 05: Advanced Scale and Spreadsheet

## Flow diagram

```text
Ready list
   |
   +--> Infinite mode --> Appending --> Exhausted
   |
   +--> Grouped mode --> grouped headers + subtotal rows
   |
   +--> Pivot mode --> analytical layout + report job cues
   |
   +--> Spreadsheet mode --> range selection + in-cell edit cues
```

## Relevant wireframes

- [Populated list viewing](./state-03-populated-list-viewing.md)
- [Appending](./state-07-appending.md)
- [Exhausted](./state-08-exhausted.md)
- [Export queued](./state-24-export-queued.md)

## Advanced cues

```text
+------------------------------------------------------------------------------------+
| toolbar-filter                                                                      |
| View: Ops pivot Q2 | Mode: pivot | Group by: Region > Status | Report job: queued |
|------------------------------------------------------------------------------------|
| table-data-region                                                                   |
| Region      Open   Blocked   Closed   Total                                         |
| North        42        8        91     141                                          |
| South        35       12        74     121                                          |
|------------------------------------------------------------------------------------|
| status rail                                                                         |
| Spreadsheet mode off | Range A3:D8 planned | Native table baseline until approved  |
+------------------------------------------------------------------------------------+
```

## Transition notes

- Grouped, pivot, report-job, and spreadsheet cues are late-phase references only.
- Native table semantics remain the default until a host explicitly enters advanced
  spreadsheet behavior.
- Queued report jobs should reuse the export status language shown in
  `state-24-export-queued.md`.
