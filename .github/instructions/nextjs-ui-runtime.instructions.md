---
name: Next.js UI Runtime
description: Use motion, next-themes, react-icons, and related UI runtime libraries in ways that preserve server-first rendering and minimal shipped client code.
applyTo: "apps/web/src/**/*.{ts,tsx},src/**/*.{ts,tsx},**/theme*.{ts,tsx},**/providers/**/*.{ts,tsx}"
---
# Next.js UI runtime

UI runtime libraries should add polish without weakening the server-first model.

Rules:

- use `motion` only inside approved client leaves when CSS or Chakra transitions are not enough
- use `next-themes` at the app-shell theme provider boundary, not as an ad hoc feature dependency
- import `react-icons` from explicit icon subpackages instead of the package root
- use `clsx` for deterministic class composition when that is clearer than manual string building
- treat `@emotion/react` as infrastructure that follows Chakra setup, not a reason to invent a parallel styling system
- keep `sharp` in server or build-time image workflows only

Do not:

- put `motion` or `next-themes` in route shells without a justified client boundary
- import the entire `react-icons` package surface
- use `sharp` from client code or browser-facing modules
