---
name: project-styling
description: >
  Project conventions for styles, CSS, and images. Use when creating, modifying,
  or reviewing files in shared/styles/, CSS modules, shared/images/, or working
  with Chakra UI styling. Covers global CSS patterns, CSS Modules usage,
  Chakra UI component styling, and image handling conventions.
---

# Project Styling Conventions

This skill covers the styling architecture for the repository, including global
CSS, CSS Modules, Chakra UI integration, and image asset management.

## Styling Approach

This project uses a **Chakra-first** styling strategy. Raw CSS is intentional
and narrow, not the default.

### Styling Layer Priority

Use styling layers in this order of preference:

1. **Chakra style props** — first choice for component-level styling
1. **Chakra theme config / globalCss** — for design-system-level global values
1. **CSS Modules** — for component-scoped raw CSS that Chakra props cannot
   express cleanly
1. **Shared global CSS** — only for cross-app browser-level concerns

### When to Use Each Layer

#### Chakra Style Props

Use for spacing, colors, layout, typography, responsive values, and
pseudo-states already supported by Chakra.

```tsx
<Box p="4" bg="gray.100" borderRadius="lg">
  <Text fontSize="sm" color="gray.900">Content</Text>
</Box>
```

#### Chakra Theme Config and globalCss

Use for base typography on `html, body`, theme-aware global values tied to
fonts, colors, tokens, or design-system defaults.

#### CSS Modules

Use when selectors are local to one component and the styles are referenced
through `styles.className`.

- File naming: `component-name.module.css`
- Class names describe the local role: `.root`, `.container`, `.heading`,
  `.actions`

#### Shared Global CSS (`src/shared/styles/`)

Use only for cross-cutting global CSS concerns that affect browser-level
elements or platform UI. Examples: custom scrollbar styles, selection behavior,
browser-specific CSS resets.

## Key Rules

### Shared Styles Folder

`src/shared/styles` is a narrow home for shared global CSS files.

- One global concern per file
- Use kebab-case file names: `scrollbar.css`, `selection.css`, `focus-ring.css`
- Import once from an app-level boundary (e.g., `src/app/[locale]/layout.tsx`)
- Do not import from random leaf components
- Do not create `index.css` or barrel-style CSS entries

### CSS Variables Over Literals

Always use CSS variables instead of hardcoded design values.

Prefer variable sources in this order:

1. Chakra CSS variables/tokens first
1. Existing shared custom properties (e.g., font variables)
1. Literal values only for narrow browser-specific or one-off cases

```css
/* Good */
.root {
  border-radius: var(--chakra-radii-lg);
  padding: var(--chakra-spacing-4);
  color: var(--chakra-colors-gray-900);
}

/* Bad */
.root {
  border-radius: 8px;
  padding: 16px;
  color: #111827;
}
```

### CSS Property Order

Order declarations in a strict 5-group sequence with one blank line between
groups:

1. **Position / z-index** — `position`, `top`, `right`, `bottom`, `left`,
   `inset`, `z-index`
1. **Display / flex / grid** — `display`, `flex-direction`, `align-items`,
   `justify-content`, `gap`
1. **Box model** — `margin`, `border`, `border-radius`, `box-sizing`,
   `padding`, `height`, `width`, `overflow`
1. **Typography** — `color`, `font-family`, `font-size`, `font-weight`,
   `line-height`, `text-align`
1. **Visual** — `background`, `box-shadow`, `opacity`, `cursor`, `transition`,
   `animation`

Within each group, sort properties alphabetically.

### Box Model Sub-Order

Within the box-model group, use this exact order: `margin`, `border`,
`border-radius`, `box-sizing`, `padding`, `height`, `min-height`,
`max-height`, `width`, `min-width`, `max-width`, `overflow`.

## Image Assets

### Placement Rules

- **Module-owned images**: `src/modules/<module-name>/images/`
- **Shared images**: `src/shared/images/` (only when truly cross-module)
- **URL-addressed assets**: `public/` (favicon, OG images, app icons)

### Image Naming

- Use kebab-case
- Include asset role prefix: `logo-`, `icon-`, `banner-`, `illustration-`,
  `empty-state-`
- Names should be meaningful outside their file location

### Format Guidance

- `svg` for logos, icons, and vector illustrations
- `webp` or `avif` for banners, photos, and raster artwork
- `png` when transparency or source constraints require it
- `jpg` or `jpeg` only for photos without transparency needs

### Image Usage

Import source-owned images from `src/**/images`:

```tsx
import Image from "next/image";

import bannerAuth from "@/shared/images/banner-auth.webp";

export function HeroBanner() {
  return <Image alt="" src={bannerAuth} />;
}
```

## Common Mistakes

### Styles

- Putting component classes into `shared/styles` instead of CSS Modules
- Using `shared/styles` as a dump for leftover CSS
- Copying theme-level design-system defaults into raw CSS files
- Importing global CSS from random leaf components
- Bundling unrelated browser tweaks into one vague file

### CSS

- Hardcoding token-like values when a Chakra CSS variable exists
- Inconsistent declaration ordering across files
- Mixing unrelated concerns in one selector
- Using CSS Modules for styles that clearly belong in Chakra props
- Using `shared/styles` for one component's private styling

### Images

- Duplicating the same asset in both `public/` and `src/**/images`
- Storing React icon components in `images/` folders
- Using large raster files for simple vector assets
- Creating barrel `index.ts` files for image folders
- Using vague names like `image1.png` or `banner-final-final.webp`

## Decision Checklist

Before adding styling or image code, check:

- Is raw CSS the right layer, or do Chakra props cover it?
- Are Chakra CSS variables used instead of hardcoded values?
- Do CSS declarations follow the 5-group property order?
- Is the image in the narrowest valid scope (module first, shared only when
  cross-cutting)?
- Is the image format appropriate for the asset type?
- Are file names specific and kebab-case?

## References

- [CSS and Styles Guide](references/css-guide.md) — full CSS and styles
  conventions
- [Images Guide](references/images-guide.md) — full image asset conventions
