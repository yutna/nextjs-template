# Flow 01: List Query Lifecycle

## Flow diagram

```text
ResolvingRouteState
        |
        v
    LoadingPage
    /    |    \
   v     v     v
Ready  Empty  Error
  |
  +---- query change ---------> LoadingPage
  |
  +---- infinite mode --------> Appending ----> Ready
                                  |              |
                                  +----------> Exhausted
                                  |
                                  +----------> Error
```

## Relevant wireframes

- [Resolving route state](./state-01-resolving-route-state.md)
- [Loading](./state-02-loading.md)
- [Populated list viewing](./state-03-populated-list-viewing.md)
- [Empty](./state-04-empty.md)
- [Error](./state-05-error.md)
- [Permission denied](./state-06-permission-denied.md)
- [Appending](./state-07-appending.md)
- [Exhausted](./state-08-exhausted.md)

## Transition notes

- Route parsing happens server-first from URL state on
  `/[locale]/(private)/operations`.
- Query changes for `page`, `pageSize`, `sort`, `filter`, `search`, `view`, and
  `density` round-trip through `nuqs`.
- `state-03-populated-list-viewing.md` is the combined happy path for query ready,
  list viewing, and export idle.
- Permission checks can short-circuit before data render and land in
  `state-06-permission-denied.md`.
- Infinite mode is optional and should only appear on hosts that justify it.
