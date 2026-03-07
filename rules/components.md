# Components Folder Style Guide

This guide defines how to write and organize UI components inside:

- `src/shared/components`
- `src/modules/<module-name>/components`

Use `components/` for stateless or presenter-oriented UI pieces. These folders are for components whose main job is rendering, visual composition, and exposing a clear props API, not owning feature orchestration or heavy stateful behavior.

## 1. Decide whether code belongs in `components`

Put code in a `components` folder when it does one or more of the following:

- renders reusable UI
- exposes a presenter-style props API
- focuses mainly on markup, styling, slots, and visual composition
- stays logic-light and does not own broader feature workflows
- can be understood primarily as a view concern

Examples:

- cards, badges, buttons, and section presenters
- empty states, not-found UIs, and error presenters
- visual wrappers used by one screen or across many screens
- small UI pieces that receive prepared data and handlers from callers

Do **not** put code in `components` when it belongs somewhere more specific:

- `containers/` for stateful orchestration and feature wiring
- `screens/` for page-level or route-level UI assembly
- `layouts/` for reusable structural frames around `children`
- `hooks/` for extracted UI logic and hook APIs
- `lib/` for integrations and architectural behavior

Rule of thumb:

- if the file is mostly about how something looks and renders, `components/` is usually correct
- if the file is mostly about how a feature works, it likely belongs outside `components/`

## 2. Presenter-first mindset

`components/` is the home of presenter-style UI.

Prefer components that:

- receive data, state, and handlers through props
- keep view logic close to rendering
- avoid owning multi-step workflows or broad feature rules
- remain easy to preview, test, and reuse

Good fits:

- a `GlassCard` that renders styling and children
- a `SectionHero` that focuses on presenting a hero section
- a `ButtonGoBack` that wraps one interaction behind a simple UI API

Avoid turning components into mini feature controllers.

If state, derived behavior, or side effects start to dominate the file:

- extract logic into `hooks/`
- move orchestration into a `container`
- keep the component focused on presentation

This matches the repository direction that view and logic should be separated even when the extracted logic is only locally reused.

## 3. Boundaries with nearby UI layers

This guide stays focused on `components`, so nearby layers are mentioned here only to define the boundary.

- use `components/` for presenter-oriented rendering units
- use `containers/` for logic binding between screens and presenter components
- use `screens/` for screen-level assembly of containers
- use `layouts/` for reusable structural framing around `children`
- use `hooks/` for extracted UI logic, even when reuse is still local

Recommended flow:

`screen` -> `container` -> `component`

Common variations:

- `layout` -> `screen` -> `container` -> `component`
- `component` -> private child presenter components

Keep the responsibility clear:

- screens assemble
- containers coordinate
- components present
- hooks hold extracted logic
- layouts frame

## 4. Scope and placement

Choose the narrowest valid scope first.

### `src/modules/<module-name>/components`

Prefer module-level components when the UI is owned by one feature module.

Good fits:

- marketing sections for one module
- checkout presenters used only by checkout flows
- feature-specific cards, filters, and visual widgets

Examples:

- `src/modules/static-pages/components/section-hero/`
- `src/modules/orders/components/order-summary-card/`

### `src/shared/components`

Promote a component to shared only when it is truly cross-module or app-wide.

Good fits:

- reusable error presenters
- shared loading or not-found UI
- generic visual building blocks used by unrelated modules

Examples:

- `src/shared/components/error-boundary/`
- `src/shared/components/not-found/`

Avoid moving feature-owned UI into `shared` too early. Promote only when:

- multiple unrelated modules use the component
- the props API is generic rather than feature-branded
- shared ownership is clearer than module ownership

## 5. File and folder structure

Follow the repository's kebab-case convention for files and folders.

Each public component should live in its own leaf folder:

```txt
src/shared/components/not-found/
├── button-go-back.tsx
├── not-found.stories.tsx
├── index.ts
├── not-found.tsx
└── types.ts

src/modules/static-pages/components/section-hero/
├── copy-command.tsx
├── index.ts
├── section-hero.stories.tsx
├── section-hero.test.tsx
├── section-hero.tsx
├── types.ts
└── constants.ts
```

Rules:

- keep one public component per folder
- name the folder and main implementation file the same
- add a leaf-level `index.ts` for the public API
- colocate `types.ts` when the component owns reusable contracts
- colocate Storybook files such as `component-name.stories.tsx` in the same component folder
- keep tests adjacent to the component they cover
- allow private child components inside the same folder when they only support that component
- allow colocated `constants.ts` when the values belong only to that component folder
- do not create parent barrel files for `src/shared/components` or `src/modules/<module-name>/components`

If a helper file becomes broadly reusable or logic-heavy, move it to a more appropriate folder instead of letting the component folder become a grab bag.

## 6. Naming

Use specific kebab-case folder and file names:

- `glass-card`
- `section-hero`
- `error-boundary`
- `not-found`

Avoid vague names such as:

- `component`
- `common`
- `shared`
- `widget`
- `thing`

For exported symbols:

- use PascalCase component names derived from the file name
- name the public component after what it presents, not where it happens to be used
- use `Props` suffixes for prop types when exported

Examples:

- `GlassCard`
- `SectionHero`
- `ErrorBoundary`
- `NotFound`
- `SectionHeroProps`

## 7. Props and API design

Presenter components should have clear, explicit inputs.

Prefer:

- props that describe rendered content and interaction hooks
- narrow, meaningful prop names
- composition through `children` when it improves flexibility
- readonly prop typing for object-shaped props

Avoid:

- huge prop bags that mirror internal implementation details
- leaking container or screen responsibilities into the component API
- making callers understand internal state machinery just to render the component

Good presenter API direction:

```ts
interface EmptyStateProps {
  description: string;
  heading: string;
  onRetry?: () => void;
}
```

Prefer component APIs that still read clearly when imported into another folder.

## 8. Client and server boundaries

Components can be server or client components, but they should stay presenter-oriented in either case.

- use server components by default when the component only needs server-safe rendering
- add `"use client"` only when the component needs hooks, browser APIs, or client-only interactivity
- add `import "server-only";` when a component must stay server-only
- do not pull client-only behavior into a server component just for convenience
- do not keep heavy client state in a presenter component when a hook or container would make the boundary clearer

Examples from the repository:

- `section-hero.tsx` is a server component focused on presentation
- `button-go-back.tsx` is a client component because it uses a navigation hook
- `not-found.tsx` stays server-oriented and delegates one client interaction to a child presenter

## 9. Styling and implementation detail boundaries

Components may own their local styling details.

Good fits inside a component folder:

- Chakra props and composition
- CSS Modules used only by that component
- small visual constants used only by that component
- private child presenters

Move code out when:

- styles are global cross-cutting concerns -> `shared/styles`
- values become broader than one component folder -> `constants/`
- logic becomes reusable or test-heavy -> `hooks/` or `utils/`

## 10. Examples

### Good shared presenter component

```tsx
// src/shared/components/not-found/not-found.tsx
export async function NotFound() {
  return <Flex minH="100vh">...</Flex>;
}
```

### Good module presenter component

```tsx
// src/modules/static-pages/components/glass-card/glass-card.tsx
export function GlassCard({ children, ...props }: Readonly<GlassCardProps>) {
  return <Box {...props}>{children}</Box>;
}
```

### Better extracted out of a component

- search-param state management
- form workflow orchestration
- async mutation handling
- cross-component selection state

These concerns usually belong in a hook or container, with the component receiving the prepared values and callbacks.

## 11. Checklist

Before adding a file to `shared/components` or `modules/<module-name>/components`, check:

- is this primarily a presenter or stateless UI concern?
- is `components/` a clearer home than `containers/`, `screens/`, `layouts/`, or `hooks/`?
- is the scope correct: module first, shared only when truly cross-module?
- does the component folder expose one public component?
- are file names specific and kebab-case?
- is the props API clear and presenter-oriented?
- should extracted logic live in a hook or container instead?
- are client and server boundaries explicit and minimal?
