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
src/modules/static-pages/components/section-hero/
├── section-hero.tsx
├── section-hero.test.tsx
├── section-hero.stories.tsx
├── copy-command.tsx
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
- allow colocated `constants.ts` and stories files
- tests adjacent to the component
- no parent barrel files for `components/`

## Naming

Files and folders use specific kebab-case names:

- `glass-card`, `section-hero`, `error-boundary`, `not-found`

Exported symbols use PascalCase derived from the file name:

- `GlassCard`, `SectionHero`, `ErrorBoundary`, `NotFound`
- prop types use `Props` suffix: `SectionHeroProps`

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

## Checklist

- [ ] Primarily a presenter or stateless UI concern
- [ ] Scope is correct: module-first, shared only when cross-module
- [ ] One public component per folder
- [ ] File names are specific and kebab-case
- [ ] Props API is clear and presenter-oriented
- [ ] Server component by default, `"use client"` only when needed
- [ ] Extracted logic lives in hooks or containers, not inline
- [ ] No parent barrel files
