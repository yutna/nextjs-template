---
name: Next.js Zag.js
description: Prefer Chakra UI, Ark UI, and Zag.js in that order for complex interactive primitives instead of inventing ad hoc client state.
applyTo: "apps/web/src/**/*.{ts,tsx},src/**/*.{ts,tsx}"
---
# Next.js Zag.js

Use Zag.js intentionally in the enterprise UI stack.

Rules:

- prefer Chakra UI first for interactive primitives already covered by the design system
- use Ark UI when a headless composition surface is needed
- use Zag.js when the interaction model itself must be explicit and reusable
- keep Zag-driven interaction logic inside the narrowest justified client island
- keep primitive interaction state separate from business workflow state

Good fits:

- menus, comboboxes, dialogs, popovers, hover cards, tooltips, tabs, accordions, steppers, and similar primitives
- accessibility-sensitive interaction patterns where keyboard and focus behavior matter

Do not:

- rebuild standard interactive primitives with bespoke `useState` and effect chains when Chakra, Ark, or Zag already fits
- use Zag.js as an excuse to widen the client boundary
- mix primitive UI machine state with domain-level business process state
