# Hooks Folder Style Guide

This guide defines how to write and organize user-authored custom hooks inside:

- `src/shared/hooks`
- `src/modules/<module-name>/hooks`

Use these folders for custom React hooks that package reusable client-side behavior behind a stable `use*` API.

## 1. Decide whether code belongs in `hooks`

Put code in a `hooks` folder when it does one or more of the following:

- uses React hooks internally
- packages reusable client-side state or effect logic
- provides a stable `use*` API consumed by components, containers, screens, or layouts
- coordinates browser-aware behavior that belongs close to UI usage

Examples:

- URL or search-param state hooks
- viewport or media-query hooks
- form interaction hooks
- reusable UI state hooks such as disclosure, selection, or filters

Do **not** put code in `hooks` when it belongs somewhere more specific:

- `lib/` for infrastructure, integrations, or framework wrappers without a hook-shaped UI API
- `utils/` for pure functions with no React hook behavior
- UI folders only when the code is truly view-only and does not represent extracted logic
- `providers/` when the concern is primarily context/provider setup rather than hook ownership

Rule of thumb:

- if the abstraction is consumed as `useSomething()`, `hooks/` is usually correct
- if the logic is pure and React-free, it is probably not a hook

## 2. Scope and placement

Choose the narrowest valid scope first.

### `src/modules/<module-name>/hooks`

Prefer module-level hooks when the behavior is owned by one feature module.

Good fits:

- order filter state
- checkout step navigation
- profile editor draft state

Examples:

- `src/modules/orders/hooks/use-order-filters/`
- `src/modules/checkout/hooks/use-checkout-step/`

### `src/shared/hooks`

Promote a hook to shared only when it is truly cross-module and generic enough to be reused outside one feature.

Good fits:

- viewport hooks
- reusable URL state hooks
- generic local storage hooks
- app-wide interaction hooks with no feature language

Examples:

- `src/shared/hooks/use-media-query/`
- `src/shared/hooks/use-local-storage/`

Avoid moving feature-owned hooks into `shared` too early. Promote only when:

- multiple unrelated modules use the same hook
- the hook name and API are generic rather than feature-specific
- shared ownership improves clarity more than it increases indirection

## 3. Boundaries with other folders

This guide stays focused on `hooks`, so adjacent folders are mentioned here only to define the boundary.

- use `hooks/` for extracted hook logic, including logic separated for clarity and testability even when reuse is currently local
- use `lib/` for non-hook infrastructure or integration code
- use `utils/` for pure React-free helpers
- use UI folders when the file is primarily rendering and the extracted logic does not need its own hook abstraction

If a function can run without React and is mainly data transformation, it likely belongs outside `hooks/`.

## 4. File and folder structure

Follow the repository's kebab-case convention for files and folders.

Each custom hook should live in its own leaf folder:

```txt
src/shared/hooks/use-local-storage/
├── index.ts
├── types.ts
└── use-local-storage.ts

src/modules/orders/hooks/use-order-filters/
├── index.ts
├── types.ts
├── use-order-filters.test.ts
└── use-order-filters.ts
```

Rules:

- keep one public hook per folder
- name the folder and main implementation file the same
- add a leaf-level `index.ts` for the hook folder
- colocate `types.ts` when the hook owns reusable contracts
- keep tests adjacent to the hook they cover
- do not create parent barrel files for `src/shared/hooks` or `src/modules/<module-name>/hooks`
- add helper files only when they materially improve clarity

If a hook needs private helpers, keep them inside the same hook folder so ownership stays obvious.

## 5. Naming

Hook names should describe the behavior they provide.

Prefer:

- `use-local-storage`
- `use-media-query`
- `use-order-filters`
- `use-checkout-step`
- `use-selection-state`

Avoid:

- `hook.ts`
- `use-data`
- `use-helper`
- `use-common`
- `state-hook`

For exported symbols:

- prefix public hooks with `use`
- use camelCase hook identifiers derived from the file name, such as `useLocalStorage` and `useOrderFilters`
- use names that still make sense when imported elsewhere

## 6. Client and server boundaries

Custom hooks are client-side abstractions.

- place `"use client"` at the top of custom hook implementation files
- do not put custom hooks in server-only files
- keep browser-only logic inside hooks or their private helpers rather than leaking it across consumers
- do not import server-only modules into hooks

If a concern spans both server and client:

- keep server work outside the hook
- pass the hook the client-usable data it needs
- keep the hook focused on client behavior and client state

Rule of thumb:

- server data preparation happens before the hook
- hook logic happens in the client layer

## 7. API and return-shape guidance

Keep hook APIs small, predictable, and explicit.

- prefer a focused parameter list or one clear options object
- return only the values and actions the consumer needs
- keep naming consistent between state and actions
- avoid mixing unrelated concerns into one hook

Good patterns:

- primitive return values for simple hooks
- object returns for multi-value hooks
- stable action names such as `setValue`, `reset`, `toggle`, or `select`

Prefer object returns when the hook exposes multiple values or actions:

```ts
export interface UseOrderFiltersReturn {
  filters: OrderFilters;
  reset: () => void;
  setFilters: (filters: OrderFilters) => void;
}
```

Avoid hooks that:

- fetch unrelated data and manage unrelated UI state in one place
- hide too much business logic behind a vague API
- expose awkward names like `doThing` or `handleStuff`

## 8. TypeScript rules

Match the repository's strict TypeScript style.

- type hook parameters and return values clearly
- prefer explicit return contracts for non-trivial hooks
- keep hook-owned reusable contracts in local `types.ts`
- use `interface` for object-shaped options and return contracts
- use `type` for unions, aliases, and other non-object shapes
- prefer `unknown` over `any` when handling untyped input

Good fits for hook-local `types.ts`:

- options objects
- return interfaces
- local value contracts shared across multiple files in the hook folder

Do not move hook-owned contracts into `src/shared/types` unless they become truly cross-cutting and are no longer clearly owned by the hook.

## 9. Hook design rules

Hooks should stay cohesive and UI-facing.

- keep one clear responsibility per hook
- compose smaller hooks when needed instead of growing one large hook
- keep side effects explicit and understandable
- derive values when possible instead of storing redundant state
- move pure helper logic into local helper files or `utils/` when React is not required

Good fits:

- state coordination
- browser event subscriptions
- reusable UI interaction state
- adapting a context or client API into a focused hook API

Usually not a fit:

- generic pure formatting helpers
- direct infrastructure clients
- view-only code with no hook-shaped behavior

## 10. Testing

Every non-trivial custom hook should have adjacent tests.

- use Vitest
- keep tests next to the hook they cover
- test public behavior, not implementation details
- cover both happy paths and edge cases
- test returned state and actions as the consumer sees them

Typical hook tests should cover:

- initial state
- state transitions
- returned actions
- boundary cases
- browser-dependent behavior when relevant

## 11. Example patterns

### Good shared hook

```txt
src/shared/hooks/use-local-storage/
├── index.ts
├── types.ts
└── use-local-storage.ts
```

```ts
"use client";

export function useLocalStorage() {
  // ...
}
```

Why it fits:

- generic enough for cross-module reuse
- clearly client-side
- one hook owns one folder

### Good module hook

```txt
src/modules/orders/hooks/use-order-filters/
├── index.ts
├── types.ts
├── use-order-filters.test.ts
└── use-order-filters.ts
```

```ts
"use client";

export function useOrderFilters() {
  // ...
}
```

Why it fits:

- behavior is owned by one module
- hook API is feature-specific
- tests stay next to the hook

### Good leaf export

```ts
export { useOrderFilters } from "./use-order-filters";
export type { UseOrderFiltersOptions, UseOrderFiltersReturn } from "./types";
```

## 12. Final checklist

Before adding a custom hook, check:

- does it truly need to be a reusable `use*` abstraction?
- should it live in a module first, or is it truly shared?
- does one hook own one folder?
- is the name descriptive and hook-shaped?
- is `"use client"` present where needed?
- is the API focused and predictable?
- are types colocated when the hook owns them?
- are tests covering the public behavior?
