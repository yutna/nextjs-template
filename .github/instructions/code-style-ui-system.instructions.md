---
name: Code Style UI System
description: Styling, motion, and static-asset rules derived from the permanent code-style law.
applyTo: "src/**/*.{ts,tsx,css},src/**/*.{svg,png,jpg,jpeg,webp,avif},public/**/*.{svg,png,jpg,jpeg,webp,avif}"
---
# Code style: UI system

Treat [the permanent code-style law](../../docs/developers/CODE_STYLE_GUIDES.md) as the full source of truth for styling, motion, and asset rules.

Keep UI implementation predictable:

- prefer Chakra style props first, then Chakra theme configuration or global theme CSS, then CSS Modules, then shared global CSS
- do not use inline `style` objects outside documented exceptions; add an explicit lint-disable reason when an inline style is truly unavoidable
- keep CSS Modules beside the component or layout they style and use narrow, role-based class names
- keep shared global CSS limited to cross-application browser concerns and import each global CSS file once from an app-level boundary
- keep motion concerns in small client leaves and import animation primitives from `motion/react`
- keep assets in the narrowest correct owner, use `kebab-case`, and reserve shared assets and public assets for genuinely shared or URL-addressed cases

Load deeper guidance when relevant:

- [code-style-react-layers](./code-style-react-layers.instructions.md)
- [code-style-tests-and-storybook](./code-style-tests-and-storybook.instructions.md)
- [code-style-reference skill](../skills/code-style-reference/SKILL.md)
