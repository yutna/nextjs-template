# CSS and Styles Guide

This reference covers the full conventions for `src/shared/styles`, CSS Modules,
and the boundary with Chakra UI styling.

## Styles Folder Style Guide

### Purpose of `shared/styles`

Use `src/shared/styles` only for cross-cutting global CSS concerns that:

- affect browser-level elements or platform UI
- need raw CSS selectors or pseudo-elements that are awkward in Chakra theme
  config
- are shared across the whole app
- are not owned by one component or one feature module

Current example:

- `scrollbar.css`

Think of `shared/styles` as the place for low-level global CSS, not as a
general-purpose styling folder.

### What Belongs in `shared/styles`

Good fits:

- custom scrollbar styles
- browser-selection behavior
- cross-app CSS resets or overrides not already handled by Chakra
- global element styling that must target raw selectors such as `html`, `body`,
  or browser pseudo-elements

Typical valid patterns:

- `html::-webkit-scrollbar`
- `::selection`
- `@media (pointer: fine)`
- browser-specific selectors that cannot be expressed cleanly through component
  props

### What Does Not Belong in `shared/styles`

Do **not** use `shared/styles` for:

- one component's styling
- one screen's styling
- one module's styling
- Chakra theme tokens
- Chakra `globalCss` values that fit naturally in the theme system
- styles that are better expressed with Chakra props on a component
- CSS Modules owned by a specific component

Use the right layer instead:

- Chakra theme config for global theme tokens and theme-level global CSS
- component style props for component-local Chakra styling
- CSS Modules for component-scoped raw CSS

### Boundary with Chakra `globalCss`

Prefer Chakra `globalCss` when the style is part of the app's design system or
theme layer.

Good Chakra `globalCss` fits:

- base typography on `html, body`
- theme-aware global values tied to fonts, colors, tokens, or design-system
  defaults

Prefer `shared/styles` when the rule needs raw CSS features that are more
natural outside the Chakra system.

Good `shared/styles` fits:

- scrollbar pseudo-elements
- browser-specific CSS behavior
- global selectors that would be noisy or awkward inside theme config

Rule of thumb:

- theme concern -> Chakra system/globalCss
- browser or raw global CSS concern -> `shared/styles`

### Boundary with CSS Modules

If the style is owned by a single component, keep it beside that component in
a CSS Module.

Example:

- `src/shared/components/error-global/error-global.module.css`

Use CSS Modules when:

- selectors are local to one component
- the styles are referenced through `styles.className`
- the CSS should not leak globally

Do not promote a CSS Module into `shared/styles` just because it is written in
CSS.

### Boundary with Chakra Style Props

Prefer Chakra style props when the styling belongs directly to a Chakra
component and does not need raw global CSS.

Good Chakra prop fits:

- spacing
- colors
- layout
- typography
- responsive values
- pseudo-states already supported by Chakra

Do not move normal component styling into `shared/styles` when Chakra props
already express it clearly.

### File Structure

Each shared global style concern should live in its own file.

Good:

```text
src/shared/styles/scrollbar.css
src/shared/styles/selection.css
```

Rules:

- use kebab-case file names
- keep one global concern per file
- do not create `index.css` or a barrel-style CSS entry in `shared/styles`
- avoid grouping unrelated global rules into one large catch-all file

### Import Location

Import shared global style files from a top-level app entry where the effect is
intentionally global.

Good fit:

- `src/app/[locale]/layout.tsx`

Good example:

```ts
import "@/shared/styles/scrollbar.css";
```

Rules:

- import `shared/styles` files once at an app-level boundary
- do not import them deep inside leaf components
- do not import the same global CSS file from multiple places

### Writing Style Rules

Keep files focused and low-level.

- write plain CSS when plain CSS is the clearest tool
- keep selectors narrow and intentional
- avoid styling app-specific component classes in `shared/styles`
- prefer comments only when browser behavior or non-obvious constraints need
  explanation
- keep global side effects easy to understand from the file name

Good example characteristics from `scrollbar.css`:

- targets `html`
- uses browser-specific scrollbar selectors
- scopes behavior with `@media (pointer: fine)`
- documents why the rule exists

### Naming

Name files after the global concern they style.

Prefer:

- `scrollbar.css`
- `selection.css`
- `focus-ring.css`

Avoid:

- `global.css`
- `shared.css`
- `common.css`
- `styles.css`
- `misc.css`

The file name should tell the reader what global concern it affects before they
open it.

### Anti-Patterns

Avoid:

- putting component classes for one feature into `shared/styles`
- using `shared/styles` as a dump for leftover CSS
- copying theme-level design-system defaults into raw CSS
- importing global CSS from random leaf components
- bundling unrelated browser tweaks into one vague file

### Review Checklist

Before adding a file to `shared/styles`, check:

- Is this truly global and shared across the app?
- Does it need raw CSS instead of Chakra theme config or Chakra props?
- Is it not better as a component CSS Module?
- Does the file have one clear global concern?
- Is the file imported once from an app-level boundary?
- Is the file name specific and kebab-case?

## CSS Style Guide

This guide applies to:

- files in `src/shared/styles`
- any `*.module.css` file

Use raw CSS intentionally. In this codebase, raw CSS is for shared global CSS
concerns and component-scoped CSS Modules, while Chakra theme config and Chakra
style props remain the first choice for most component styling.

### Scope

Use this guide for:

- shared global CSS files such as `src/shared/styles/scrollbar.css`
- component-scoped CSS Modules such as `error-global.module.css`

This guide does **not** redefine when CSS should be used. It defines how CSS
should be written once raw CSS is the right tool.

Within the box-model group, use this exact order: `margin`, `border`,
`border-radius`, `box-sizing`, `padding`, `height`, `min-height`,
`max-height`, `width`, `min-width`, `max-width`, `overflow`.

### Prefer CSS Variables Over Literals

Always use CSS variables instead of hardcoded design values when a
variable-backed token exists.

Prefer variable sources in this order:

1. Chakra CSS variables/tokens first
1. existing shared custom properties already owned by the app, such as font
   variables
1. literal values only for narrow browser-specific or one-off cases where a
   token is not practical

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

Valid shared examples in this repo already include app-owned CSS variables such
as:

- `var(--font-noto-sans-thai)`
- `var(--font-jetbrains-mono)`

### Allowed Exceptions to the Variable Rule

Literals are allowed only when a variable is not realistic or would make the
CSS harder to understand.

Typical exceptions:

- browser-specific properties such as `scrollbar-width`
- vendor pseudo-element styling such as `::-webkit-scrollbar`
- transparent/background keywords
- one-off fallback values in browser behavior rules
- highly specific gradient or rgba values when no token exists yet

If you use a literal for a reusable design value, prefer creating or reusing a
token instead.

### CSS Property Order

Always order declarations in this 5-group sequence, with exactly one blank line
between groups:

1. **Position / z-index**
1. **Display / flex / grid**
1. **Box model**
1. **Typography**
1. **Visual**

#### Group Details

##### Group 1 — Position / z-index

Examples:

- `position`
- `top`
- `right`
- `bottom`
- `left`
- `inset`
- `z-index`

##### Group 2 — Display / flex / grid

Examples:

- `display`
- `flex-direction`
- `flex-wrap`
- `align-items`
- `justify-content`
- `place-items`
- `grid-template-columns`
- `gap`

##### Group 3 — Box model

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

##### Group 4 — Typography

Examples:

- `color`
- `font-family`
- `font-size`
- `font-weight`
- `line-height`
- `letter-spacing`
- `text-align`
- `text-decoration`

##### Group 5 — Visual

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

### Property Ordering Example

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

### Sorting Inside Each Group

Within each group:

- sort properties alphabetically (`a-z`, case-insensitive)
- keep vendor-prefixed properties directly above the standard property they
  support when both are needed
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

### Shared Global CSS vs CSS Modules

#### `src/shared/styles`

Use shared global CSS for cross-app concerns such as:

- scrollbars
- selection styling
- browser-level global behavior
- raw selectors targeting `html`, `body`, or browser pseudo-elements

#### `*.module.css`

Use CSS Modules for component-owned styling such as:

- local layout
- local typography treatment
- component-specific gradients, dividers, and buttons
- selectors referenced through `styles.className`

Rule of thumb:

- global concern -> `src/shared/styles`
- component concern -> `*.module.css`

### Boundary with Chakra Styling

Prefer Chakra theme config or Chakra props when they express the styling
cleanly.

Use raw CSS only when you need:

- browser-specific selectors
- global CSS side effects
- CSS Modules for component-owned selectors not worth expressing as prop objects
- CSS behavior that is clearer in a stylesheet than in inline style props

Do not move normal Chakra component styling into CSS just because CSS can
express it.

### Selector Rules

- keep selectors narrow and intentional
- avoid deep descendant selectors when a local class is clearer
- do not style unrelated app areas from one CSS Module
- do not use global selectors inside CSS Modules unless the escape is truly
  necessary

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

### Comments

Keep comments rare and useful.

Good reasons to comment:

- browser quirks
- vendor-specific behavior
- non-obvious constraints

Do not add comments just to describe obvious declarations.

### CSS Module and Shared Style Naming

#### Shared Styles

Use kebab-case file names based on the global concern:

- `scrollbar.css`
- `selection.css`
- `focus-ring.css`

Avoid:

- `global.css`
- `common.css`
- `misc.css`

#### CSS Modules

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

### CSS Anti-Patterns

Avoid:

- hardcoded token-like values when a Chakra CSS variable exists
- inconsistent declaration ordering
- mixing unrelated concerns in one selector
- importing shared global CSS from random leaf components
- using CSS Modules for styles that clearly belong in Chakra props
- using shared global CSS for one component's private styling

### CSS Review Checklist

Before committing a CSS file, check:

- Is raw CSS the right layer here?
- Are Chakra CSS variables/tokens used first?
- Are literals limited to justified exceptions?
- Do declarations follow the 5-group order?
- Are properties alphabetized within each group?
- Is there exactly one blank line between groups?
- Is the selector scope appropriate for shared global CSS or a CSS Module?
