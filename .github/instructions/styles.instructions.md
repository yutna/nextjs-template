---
applyTo: "src/shared/styles/**,**/*.module.css"
---

# Styles and CSS

## Styling priority order

1. **Chakra UI style props** — first choice for component-level styling
2. **Chakra theme config / `globalCss`** — for theme-level global tokens
3. **CSS Modules** (`*.module.css`) — when Chakra props do not fit
4. **Shared global CSS** (`src/shared/styles/`) — for cross-app browser-level concerns

## Global CSS (`src/shared/styles`)

Only for cross-cutting global CSS concerns that affect the whole app.

Good fits:

- Custom scrollbar styles (`scrollbar.css`)
- Browser selection behavior (`selection.css`)
- Global element styling targeting `html`, `body`, or browser pseudo-elements
- Browser-specific selectors not expressible through Chakra

Rules:

- One global concern per file, kebab-case names
- Import once from an app-level boundary (`src/app/[locale]/layout.tsx`)
- Do not import from random leaf components
- Do not create `index.css` or barrel-style CSS entries
- Do not put component-specific styles here

## CSS Modules (`*.module.css`)

For component-scoped styling when Chakra props are not a good fit.

- Keep the module file beside the component it styles
- Reference classes through `styles.className`
- Class names describe the local role: `.root`, `.container`, `.heading`, `.actions`

## Animation (motion)

Import from `motion/react` — the package was renamed from
`framer-motion` to `motion` in v12:

```tsx
import { motion } from "motion/react";
```

- Keep animation components in `components/` as client leaves
- Prefer server-rendered layouts; animate only client leaves
- Use `motion.div`, `AnimatePresence`, and `variants` for
  declarative animations

## When to use raw CSS vs Chakra

Use Chakra props for:

- Spacing, colors, layout, typography, responsive values
- Pseudo-states already supported by Chakra

Use raw CSS when you need:

- Browser-specific selectors or pseudo-elements
- Global CSS side effects
- Component-scoped selectors not worth expressing as prop objects

Do **not** use inline `style` objects. This is enforced by ESLint (`project/no-inline-style`).
If a legitimate case requires inline styles (e.g., CSS custom property injection),
add an `eslint-disable` comment with a brief reason.

## CSS variables over literals

Always prefer CSS variables over hardcoded design values:

1. Chakra CSS variables first (`var(--chakra-radii-lg)`, `var(--chakra-spacing-4)`)
2. App-owned custom properties (`var(--font-noto-sans-thai)`)
3. Literals only for browser-specific or one-off cases

## CSS property order (5-group sequence)

Order declarations in this sequence with one blank line between groups:

1. **Position / z-index** — `position`, `top`, `right`, `bottom`, `left`, `z-index`
2. **Display / flex / grid** — `display`, `flex-direction`, `align-items`, `gap`
3. **Box model** — `margin`, `border`, `border-radius`, `padding`, `width`, `height`
4. **Typography** — `color`, `font-family`, `font-size`, `font-weight`, `line-height`
5. **Visual** — `background`, `box-shadow`, `opacity`, `cursor`, `transition`

Sort properties alphabetically within each group.

## CSS Module naming

- File: follows the component file name (`error-global.module.css`)
- Classes: describe local role (`.root`, `.heading`, `.actions`)
- Avoid vague names: `.box`, `.item2`, `.redText`

## Checklist

- [ ] Is Chakra props the right layer? Use raw CSS only when needed
- [ ] Chakra CSS variables used before literal values
- [ ] Declarations follow the 5-group property order
- [ ] Properties alphabetized within each group
- [ ] Global CSS is truly global, not component-specific
- [ ] CSS Module is beside its owning component
- [ ] Global CSS imported once from app-level boundary
- [ ] File names are specific and kebab-case
- [ ] No inline style objects (enforced by ESLint; use `eslint-disable` with reason if needed)
