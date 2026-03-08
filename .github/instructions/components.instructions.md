---
applyTo: "src/modules/**/components/**,src/shared/components/**"
---

# Components Guardrails

Rules for writing UI components in `src/modules/<module>/components/` and
`src/shared/components/`.

## Presenter-first mindset

Components are stateless or logic-light presenter UI. Their main job is
rendering, visual composition, and exposing a clear props API.

Prefer components that:

- receive data, state, and handlers through props
- keep view logic close to rendering
- avoid owning multi-step workflows or feature orchestration
- remain easy to preview, test, and reuse

If state or side effects start to dominate, extract logic into `hooks/` or
move orchestration into a `container`.

## Module-first scope

- feature-owned UI goes in `src/modules/<module>/components/`
- promote to `src/shared/components/` only when truly cross-module

Promote only when:

- multiple unrelated modules use the component
- the props API is generic, not feature-branded
- shared ownership is clearer than module ownership

## Folder structure

Each public component lives in its own leaf folder:

```text
src/modules/static-pages/components/landing-hero/
├── landing-hero.tsx
├── landing-hero.test.tsx
├── constants.ts
├── index.ts
└── types.ts
```

Rules:

- one public component per folder
- folder and main file share the same kebab-case name
- leaf-level `index.ts` for the public API
- colocate `types.ts` for prop contracts
- allow private child components in the same folder
- allow colocated `constants.ts` and story files
- story file: `{component-name}.stories.tsx` (see `storybook-stories`
  instruction for full conventions)
- tests adjacent to the component
- no parent barrel files for `components/`

## Naming

All React component names follow a **UI-type-first, domain-last** pattern.
Place the UI structural role before the domain noun.

Files and folders use specific kebab-case names:

- `form-checkout`, `card-product-detail`, `header-profile`, `landing-hero`

Exported symbols use PascalCase derived from the file name:

- `FormCheckout`, `CardProductDetail`, `HeaderProfile`, `LandingHero`
- prop types use `Props` suffix: `FormCheckoutProps`

Avoid vague names: `component`, `common`, `widget`, `thing`.

## Props and API

- describe rendered content and interaction hooks
- use narrow, meaningful prop names
- use `children` for composition when it improves flexibility
- wrap with `Readonly<>` for object-shaped props

```ts
interface EmptyStateProps {
  description: string;
  heading: string;
  onRetry?: () => void;
}
```

Avoid huge prop bags that mirror internal implementation details.

## No hook spreading

Do not spread hook return values directly into JSX props.
This is enforced by ESLint (`project/no-hook-spread`).

```tsx
// Bad — hides what the component actually receives
const form = useCheckoutForm();
<CheckoutForm {...form} />;

// Good — explicit prop binding
const form = useCheckoutForm();
<CheckoutForm errors={form.errors} onSubmit={form.onSubmit} values={form.values} />;
```

Spreading **rest props** from a component's own parameters is fine:

```tsx
function Card({ title, ...props }: Readonly<CardProps>) {
  return <Box {...props}>{title}</Box>;
}
```

## Server-first boundaries

- server components by default
- add `"use client"` only for hooks, browser APIs, or client interactivity
- add `import "server-only";` when a component must never enter the client
  bundle
- keep heavy client state in hooks or containers, not in presenter
  components

## Boundaries with other layers

The flow is: `screen` → `container` → `component`

- screens assemble containers
- containers coordinate and bind
- components present
- hooks hold extracted logic

Components should **not** absorb orchestration just because no container
exists yet.

### Import boundaries

Components may import:

- other components (same module or `shared/components/`)
- shared utilities (`utils/`, `lib/`, `constants/`, `config/`)
- external libraries

Components must **not** import from:

- `containers/` — containers consume components, never the reverse
- `screens/` — screens are above components in the layer hierarchy
- `actions/` — actions are called from containers, not components
- `hooks/` — hooks are called from containers, not components
- `contexts/` — context consumption belongs in hooks or containers
- `providers/` — providers wrap children at boundary layers

This enforces the unidirectional flow: `page → screen → container → component`.
If a component needs data or behavior from a container, it must receive
it through props.

## Leaf index.ts exports

When a `types.ts` file exists in the component folder, `index.ts` must
re-export its types. Value exports come first, type exports come last.

```ts
export { LandingHero } from "./landing-hero";

export type { LandingHeroProps } from "./types";
```

## Checklist

- [ ] Primarily a presenter or stateless UI concern
- [ ] Scope is correct: module-first, shared only when cross-module
- [ ] One public component per folder
- [ ] File names are specific and kebab-case
- [ ] Props API is clear and presenter-oriented
- [ ] Server component by default, `"use client"` only when needed
- [ ] Extracted logic lives in hooks or containers, not inline
- [ ] No imports from containers, screens, actions, hooks, or contexts
- [ ] `index.ts` re-exports types from `types.ts` when it exists
- [ ] Value exports before type exports in `index.ts`
- [ ] No parent barrel files
