# Flow 02: View Customization

## Flow diagram

```text
DefaultView -- resize / visibility / density --> DirtyView
    ^                                            |
    |                                            v
    +---------------------- reset ------------ SavingView
                                                  |
                                      +-----------+-----------+
                                      v                       v
                                  SavedView                ViewError
                                      |
                                      v
                                  ApplyingView
                                      |
                                      v
                                  SavedView
```

## Relevant wireframes

- [Default view](./state-09-default-view.md)
- [Dirty view](./state-10-dirty-view.md)
- [Saving view](./state-11-saving-view.md)
- [Saved view](./state-12-saved-view.md)
- [Applying view](./state-13-applying-view.md)
- [View error](./state-14-view-error.md)

## Transition notes

- Shareable route state stays in the URL; comfort state such as widths can remain
  local-first.
- The bulk action bar is not part of this flow unless rows are selected separately.
- View saving uses `operations-data-grid-save-view*` selectors and should never block
  the canonical list route from reloading cleanly.
