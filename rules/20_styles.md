# Styles Folder Style Guide

This guide defines how to use `src/shared/styles`.

`src/shared/styles` is a narrow home for shared global CSS files that must exist outside component-local styling and outside Chakra theme configuration.

## 1. Purpose of `shared/styles`

Use `src/shared/styles` only for cross-cutting global CSS concerns that:

- affect browser-level elements or platform UI
- need raw CSS selectors or pseudo-elements that are awkward in Chakra theme config
- are shared across the whole app
- are not owned by one component or one feature module

Current example:

- `scrollbar.css`

Think of `shared/styles` as the place for low-level global CSS, not as a general-purpose styling folder.

## 2. What belongs in `shared/styles`

Good fits:

- custom scrollbar styles
- browser-selection behavior
- cross-app CSS resets or overrides not already handled by Chakra
- global element styling that must target raw selectors such as `html`, `body`, or browser pseudo-elements

Typical valid patterns:

- `html::-webkit-scrollbar`
- `::selection`
- `@media (pointer: fine)`
- browser-specific selectors that cannot be expressed cleanly through component props

## 3. What does not belong in `shared/styles`

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

## 4. Boundary with Chakra `globalCss`

Prefer Chakra `globalCss` when the style is part of the app's design system or theme layer.

Good Chakra `globalCss` fits:

- base typography on `html, body`
- theme-aware global values tied to fonts, colors, tokens, or design-system defaults

Prefer `shared/styles` when the rule needs raw CSS features that are more natural outside the Chakra system.

Good `shared/styles` fits:

- scrollbar pseudo-elements
- browser-specific CSS behavior
- global selectors that would be noisy or awkward inside theme config

Rule of thumb:

- theme concern -> Chakra system/globalCss
- browser or raw global CSS concern -> `shared/styles`

## 5. Boundary with CSS Modules

If the style is owned by a single component, keep it beside that component in a CSS Module.

Example:

- `src/shared/components/error-global/error-global.module.css`

Use CSS Modules when:

- selectors are local to one component
- the styles are referenced through `styles.className`
- the CSS should not leak globally

Do not promote a CSS Module into `shared/styles` just because it is written in CSS.

## 6. Boundary with Chakra style props

Prefer Chakra style props when the styling belongs directly to a Chakra component and does not need raw global CSS.

Good Chakra prop fits:

- spacing
- colors
- layout
- typography
- responsive values
- pseudo-states already supported by Chakra

Do not move normal component styling into `shared/styles` when Chakra props already express it clearly.

## 7. File structure

Each shared global style concern should live in its own file.

Good:

```txt
src/shared/styles/scrollbar.css
src/shared/styles/selection.css
```

Rules:

- use kebab-case file names
- keep one global concern per file
- do not create `index.css` or a barrel-style CSS entry in `shared/styles`
- avoid grouping unrelated global rules into one large catch-all file

## 8. Import location

Import shared global style files from a top-level app entry where the effect is intentionally global.

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

## 9. Writing style rules

Keep files focused and low-level.

- write plain CSS when plain CSS is the clearest tool
- keep selectors narrow and intentional
- avoid styling app-specific component classes in `shared/styles`
- prefer comments only when browser behavior or non-obvious constraints need explanation
- keep global side effects easy to understand from the file name

Good example characteristics from `scrollbar.css`:

- targets `html`
- uses browser-specific scrollbar selectors
- scopes behavior with `@media (pointer: fine)`
- documents why the rule exists

## 10. Naming

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

The file name should tell the reader what global concern it affects before they open it.

## 11. Anti-patterns

Avoid:

- putting component classes for one feature into `shared/styles`
- using `shared/styles` as a dump for leftover CSS
- copying theme-level design-system defaults into raw CSS
- importing global CSS from random leaf components
- bundling unrelated browser tweaks into one vague file

## 12. Review checklist

Before adding a file to `shared/styles`, check:

- Is this truly global and shared across the app?
- Does it need raw CSS instead of Chakra theme config or Chakra props?
- Is it not better as a component CSS Module?
- Does the file have one clear global concern?
- Is the file imported once from an app-level boundary?
- Is the file name specific and kebab-case?
