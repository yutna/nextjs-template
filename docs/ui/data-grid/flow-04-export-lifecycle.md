# Flow 04: Export Lifecycle

## Flow diagram

```text
ExportIdle --> ExportRequested --> ExportReady
                   |
                   +--> ExportQueued --> ExportReady
                   |
                   +--> ExportError -- retry --> ExportRequested
```

## Relevant wireframes

- [Populated list viewing](./state-03-populated-list-viewing.md)
- [Export requested](./state-22-export-requested.md)
- [Export ready](./state-23-export-ready.md)
- [Export queued](./state-24-export-queued.md)
- [Export error](./state-25-export-error.md)

## Transition notes

- CSV is the early synchronous path.
- XLSX and PDF may queue long-running jobs and surface job IDs in the drawer context
  panel.
- Export status stays inline on the list screen so users do not lose filter context.
