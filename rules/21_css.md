# CSS Style Guide

This guide applies to:

- files in `src/shared/styles`
- any `*.module.css` file

Use raw CSS intentionally. In this codebase, raw CSS is for shared global CSS concerns and component-scoped CSS Modules, while Chakra theme config and Chakra style props remain the first choice for most component styling.

## 1. Scope

Use this guide for:

- shared global CSS files such as `src/shared/styles/scrollbar.css`
- component-scoped CSS Modules such as `error-global.module.css`

This guide does **not** redefine when CSS should be used. It defines how CSS should be written once raw CSS is the right tool.

Within the box-model group, use this exact order: `margin`, `border`, `border-radius`, `box-sizing`, `padding`, `height`, `min-height`, `max-height`, `width`, `min-width`, `max-width`, `overflow`.

## 2. Prefer CSS variables over literals

Always use CSS variables instead of hardcoded design values when a variable-backed token exists.

Prefer variable sources in this order:

1. Chakra CSS variables/tokens first
2. existing shared custom properties already owned by the app, such as font variables
3. literal values only for narrow browser-specific or one-off cases where a token is not practical

Prefer:

```css
.root {
  border-radius: var(--chakra-radii-lg);
  padding: var(--chakra-spacing-4);

  color: var(--chakra-colors-gray-900);
  font-size: var(--chakra-font-sizes-sm);
}
```

Avoid:

```css
.root {
  border-radius: 8px;
  color: #111827;
  font-size: 14px;
  padding: 16px;
}
```

Valid shared examples in this repo already include app-owned CSS variables such as:

- `var(--font-noto-sans-thai)`
- `var(--font-jetbrains-mono)`

## 3. Allowed exceptions to the variable rule

Literals are allowed only when a variable is not realistic or would make the CSS harder to understand.

Typical exceptions:

- browser-specific properties such as `scrollbar-width`
- vendor pseudo-element styling such as `::-webkit-scrollbar`
- transparent/background keywords
- one-off fallback values in browser behavior rules
- highly specific gradient or rgba values when no token exists yet

If you use a literal for a reusable design value, prefer creating or reusing a token instead.

## 4. CSS property order

Always order declarations in this 5-group sequence, with exactly one blank line between groups:

1. **Position / z-index**
2. **Display / flex / grid**
3. **Box model**
4. **Typography**
5. **Visual**

### Group details

#### 1. Position / z-index

Examples:

- `position`
- `top`
- `right`
- `bottom`
- `left`
- `inset`
- `z-index`

#### 2. Display / flex / grid

Examples:

- `display`
- `flex-direction`
- `flex-wrap`
- `align-items`
- `justify-content`
- `place-items`
- `grid-template-columns`
- `gap`

#### 3. Box model

Examples:

- `margin`
- `border`
- `border-radius`
- `box-sizing`
- `padding`
- `height`
- `min-height`
- `max-height`
- `width`
- `min-width`
- `max-width`
- `overflow`

#### 4. Typography

Examples:

- `color`
- `font-family`
- `font-size`
- `font-weight`
- `line-height`
- `letter-spacing`
- `text-align`
- `text-decoration`

#### 5. Visual

Examples:

- `background`
- `background-color`
- `background-image`
- `box-shadow`
- `opacity`
- `cursor`
- `user-select`
- `transition`
- `animation`

## 5. Property ordering example

Good:

```css
.root {
  position: relative;
  z-index: 1;

  align-items: center;
  display: flex;
  flex-direction: column;
  gap: var(--chakra-spacing-4);
  justify-content: center;

  margin: 0;
  border: 1px solid var(--chakra-colors-gray-200);
  border-radius: var(--chakra-radii-lg);
  box-sizing: border-box;
  padding: var(--chakra-spacing-4);
  width: 100%;

  color: var(--chakra-colors-gray-900);
  font-family: var(--font-noto-sans-thai), sans-serif;
  font-size: var(--chakra-font-sizes-sm);
  font-weight: var(--chakra-font-weights-semibold);
  line-height: 1.5;
  text-align: left;

  background-color: var(--chakra-colors-white);
  box-shadow: var(--chakra-shadows-sm);
  opacity: 1;
  transition: background-color 0.2s ease;
}
```

Avoid:

```css
.root {
  background-color: white;
  padding: 16px;
  display: flex;
  color: #111827;
  border-radius: 8px;
  align-items: center;
}
```

## 6. Sorting inside each group

Within each group:

- sort properties alphabetically (`a-z`, case-insensitive)
- keep vendor-prefixed properties directly above the standard property they support when both are needed
- use exactly one blank line between groups
- do not add comments just to label the groups in normal code

Example:

```css
.number {
  color: transparent;
  font-size: clamp(6rem, 20vw, 11rem);
  font-weight: 900;
  line-height: 1;

  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-image: linear-gradient(
    to right,
    var(--chakra-colors-red-500),
    var(--chakra-colors-red-700)
  );
  user-select: none;
}
```

## 7. Shared global CSS vs CSS Modules

### `src/shared/styles`

Use shared global CSS for cross-app concerns such as:

- scrollbars
- selection styling
- browser-level global behavior
- raw selectors targeting `html`, `body`, or browser pseudo-elements

### `*.module.css`

Use CSS Modules for component-owned styling such as:

- local layout
- local typography treatment
- component-specific gradients, dividers, and buttons
- selectors referenced through `styles.className`

Rule of thumb:

- global concern -> `src/shared/styles`
- component concern -> `*.module.css`

## 8. Boundary with Chakra styling

Prefer Chakra theme config or Chakra props when they express the styling cleanly.

Use raw CSS only when you need:

- browser-specific selectors
- global CSS side effects
- CSS Modules for component-owned selectors not worth expressing as prop objects
- CSS behavior that is clearer in a stylesheet than in inline style props

Do not move normal Chakra component styling into CSS just because CSS can express it.

## 9. Selector rules

- keep selectors narrow and intentional
- avoid deep descendant selectors when a local class is clearer
- do not style unrelated app areas from one CSS Module
- do not use global selectors inside CSS Modules unless the escape is truly necessary

Good:

```css
.actions {
  display: flex;
  gap: var(--chakra-spacing-4);
  justify-content: center;
}
```

Avoid:

```css
.root div div a {
  color: red;
}
```

## 10. Comments

Keep comments rare and useful.

Good reasons to comment:

- browser quirks
- vendor-specific behavior
- non-obvious constraints

Do not add comments just to describe obvious declarations.

## 11. Naming

### Shared styles

Use kebab-case file names based on the global concern:

- `scrollbar.css`
- `selection.css`
- `focus-ring.css`

Avoid:

- `global.css`
- `common.css`
- `misc.css`

### CSS Modules

Follow the component file name:

- `error-global.module.css`
- `section-hero.module.css`

Class names should describe the local role:

- `.root`
- `.container`
- `.heading`
- `.actions`

Avoid vague names such as:

- `.box`
- `.item2`
- `.redText`

## 12. Anti-patterns

Avoid:

- hardcoded token-like values when a Chakra CSS variable exists
- inconsistent declaration ordering
- mixing unrelated concerns in one selector
- importing shared global CSS from random leaf components
- using CSS Modules for styles that clearly belong in Chakra props
- using shared global CSS for one component's private styling

## 13. Review checklist

Before committing a CSS file, check:

- Is raw CSS the right layer here?
- Are Chakra CSS variables/tokens used first?
- Are literals limited to justified exceptions?
- Do declarations follow the 5-group order?
- Are properties alphabetized within each group?
- Is there exactly one blank line between groups?
- Is the selector scope appropriate for shared global CSS or a CSS Module?
