# Phase 07: Virtualization, Pivot, and Report Jobs

## Goal

Add scale-driven and spreadsheet-like capabilities only after real usage justifies
their complexity.

## Priority

`@could`

## Included checklist items

- Virtual Scrolling (Row Virtualization)
- Lazy Loading / Infinite Scroll
- Column Virtualization
- In-cell Editing
- Cell/Range Selection
- Pivot Mode
- PDF Export

## Vertical slices

1. **Measured row virtualization**
   - Add row virtualization only after benchmarks show the non-virtualized list is a
     bottleneck.

2. **Infinite scroll and column virtualization**
   - Add only for hosts that need them and can validate accessibility tradeoffs.

3. **Spreadsheet mode**
   - Add in-cell editing and range selection only if the host workflow truly needs
     spreadsheet-like behavior.
   - Upgrade semantics from native table toward ARIA grid only for these hosts.

4. **Analytical pivot and report jobs**
   - Add pivot mode and PDF/report generation.
   - Move large exports to Trigger.dev jobs with observable status.

## Dependencies

- Real performance measurements from earlier phases
- Product sign-off that spreadsheet interactions are worth the accessibility and
  complexity cost

## Validation focus

- Virtualization thresholds are evidence-based
- Accessibility is re-evaluated before enabling spreadsheet behavior
- Large export jobs are resilient and observable

## Exit criteria

- Advanced scale and spreadsheet behaviors exist only where justified by measured use
  and approved product needs
