# Phase 01: Foundation and Host Contract

## Goal

Create the reusable grid foundation and host-route contract without creating a
standalone data-grid route.

## Priority

`@must`

## Included checklist items

- Client-side Pagination
- Responsive Design
- Theming and Dark Mode
- Localization (i18n)
- Accessibility (WCAG 2.1)
- Strongly Typed props/events/models
- Custom Cell Renderers
- Headless Support

## Vertical slices

1. **Host-route contract**
   - Define the rule that host modules own canonical list and detail routes.
   - Define `nuqs` query keys and which ones are shareable from day one.

2. **Shared headless foundation**
   - Define typed row, column, renderer, masking, and empty/loading/error contracts.
   - Keep the foundation route-agnostic and resource-agnostic.

3. **Bounded dataset table shell**
   - Support native table rendering and small-dataset client-side pagination.
   - Provide compact density tokens that can be reused by R01.

4. **Baseline UX compatibility**
   - Require responsive behavior, Chakra theming, dark mode, `en` and `th`, and
     WCAG 2.1 semantics.

## Dependencies

- None beyond existing repository conventions

## Validation focus

- Typed contracts stay shared and route-agnostic
- Native table semantics remain the baseline
- Locale and theme behavior work without extra client-only wrappers
- Test IDs are host-prefixed, not hardcoded to the shared component

## Exit criteria

- A host module can render a bounded list with the shared foundation
- The shared grid does not own routing, data fetching, or persistence
- The first adopter can move into server-driven R01 work next
