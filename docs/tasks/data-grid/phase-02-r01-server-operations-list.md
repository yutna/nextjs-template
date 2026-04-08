# Phase 02: R01 Server Operations List

## Goal

Ship the first enterprise operations list with compact density and server-side query
behavior.

## Priority

`@must`

## Included checklist items

- Server-side Pagination
- Data Masking
- Multi-column Sorting
- Global Search
- Column-level Filters: text / number / date

## Vertical slices

1. **Shareable server query route**
   - Parse list state from `nuqs`.
   - Keep `page`, `pageSize`, `sort`, `filter`, `search`, `view`, and `density`
     shareable on the host route.

2. **Server-driven list retrieval**
   - Add host repository and service behavior for pagination, sorting, search, and
     basic filters.
   - Enforce masking on sensitive columns before render.

3. **R01 screen behavior**
   - Render compact density by default.
   - Support loading, empty, and error states from the host route.

## Dependencies

- Phase 01 foundation and host-route contract
- Product choice for first adopter resource
- Query schema and masking policy approval

## Validation focus

- URL state is shareable and restorable
- Sorting and filtering re-query the server instead of mutating local-only data
- Masked values never leak in the rendered payload
- Empty and error states remain localized in `en` and `th`

## Exit criteria

- The first adopter can use the shared grid for a large dataset
- Server-side pagination, search, sort, and basic filters are production-ready
- Compact-density R01 behavior is documented and testable
