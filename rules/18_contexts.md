# Contexts Folder Style Guide

This guide defines how to write and organize user-authored React contexts inside:

- `src/shared/contexts`
- `src/modules/<module-name>/contexts`

Use these folders for the context object and its context-owned contracts. Keep providers in `providers/` and consumer hooks in `hooks/`.

## 1. Decide whether code belongs in `contexts`

Put code in a `contexts` folder when it does one or more of the following:

- creates a React context with `createContext`
- defines the context value contract
- defines context-related types owned by that context
- provides the low-level context object consumed by a provider or consumer hook

Examples:

- order filters context
- checkout flow context
- UI preferences context
- selection state context

Do **not** put code in `contexts` when it belongs somewhere more specific:

- `providers/` for provider components
- `hooks/` for consumer hooks and other custom hooks
- `lib/` for infrastructure or integration concerns
- `utils/` for pure React-free helpers
- UI folders when the file is only rendering

Rule of thumb:

- if the file's main job is defining the context object, `contexts/` is usually correct
- if the file's main job is providing or consuming that context, it belongs elsewhere

## 2. Scope and placement

Choose the narrowest valid scope first.

### `src/modules/<module-name>/contexts`

Prefer module-level contexts when the context is owned by one feature module.

Good fits:

- order filter context
- checkout flow context
- profile editor context

Examples:

- `src/modules/orders/contexts/order-filters/`
- `src/modules/checkout/contexts/checkout-flow/`

### `src/shared/contexts`

Promote a context to shared only when it is truly cross-module or app-wide.

Good fits:

- shared UI preferences context
- app-wide client-side selection context
- shared subtree state used by unrelated features

Examples:

- `src/shared/contexts/ui-preferences/`
- `src/shared/contexts/app-selection/`

Avoid moving feature-owned contexts into `shared` too early. Promote only when:

- multiple unrelated modules depend on the same context
- the value shape is generic rather than feature-specific
- shared ownership improves clarity more than it increases indirection

## 3. Boundaries with other folders

This guide stays focused on `contexts`, so adjacent folders are mentioned here only to define the boundary.

- use `contexts/` for the context object and context-owned contracts
- use `providers/` for provider components built on top of those contexts
- use `hooks/` for consumer hooks that wrap `useContext`
- use `types.ts` inside the context folder when the context owns those contracts

Recommended flow:

`contexts/` -> `providers/` -> `hooks/`

The context is the primitive. The provider exposes it to a subtree. The hook gives consumers a clean API.

## 4. File and folder structure

Follow the repository's kebab-case convention for files and folders.

Each context should live in its own leaf folder:

```txt
src/shared/contexts/ui-preferences/
├── index.ts
├── types.ts
└── ui-preferences-context.ts

src/modules/orders/contexts/order-filters/
├── index.ts
├── order-filters-context.ts
└── types.ts
```

Rules:

- keep one context per folder
- name the folder after the concern
- name the context file `<concern>-context.ts`
- add a leaf-level `index.ts` for that context folder
- colocate `types.ts` when the context owns reusable contracts
- do not create parent barrel files for `src/shared/contexts` or `src/modules/<module-name>/contexts`
- keep provider and consumer hook files out of `contexts/`

## 5. Naming

Name the folder after the concern, not after React primitives alone.

Prefer:

- `ui-preferences`
- `checkout-flow`
- `order-filters`
- `selection-state`

Avoid:

- `context`
- `provider`
- `shared-context`
- `app-context`
- `common-state`

For files and exports:

- name the file `<concern>-context.ts`
- use descriptive exported names such as `OrderFiltersContext` and `UiPreferencesContext`
- keep names meaningful when imported elsewhere

## 6. Client boundaries

React context creation in this codebase should be treated as a client-side concern.

- place `"use client"` in context implementation files when required
- do not import server-only modules into contexts
- keep server data preparation outside the context folder
- keep the context file focused on the context primitive and its owned contracts

If server data needs to reach consumers:

- prepare that data before the provider boundary
- pass it into the provider through explicit props
- keep the context definition itself free of server-only concerns

## 7. TypeScript rules

Match the repository's strict TypeScript style.

- keep context-owned contracts in local `types.ts`
- type the context value shape explicitly
- use `interface` for object-shaped context value contracts
- use `import type` for type-only imports
- keep the context value shape owned by the context folder, not scattered across providers and hooks

Good fits for context-local `types.ts`:

- context value interface
- default-value helper types
- other contracts shared by the context file and provider

Do not move context-owned contracts into `src/shared/types` unless they become truly cross-cutting and are no longer clearly owned by one context.

## 8. Context design rules

Contexts should stay narrow and intentional.

- keep one clear responsibility per context
- prefer multiple focused contexts over one oversized global context
- use context only when props or a plain hook are no longer a good fit
- keep the context value explicit and understandable
- move pure helper logic into local helpers or `utils/` when React is not required

Good fits:

- shared subtree state
- feature-scoped coordination state
- shared client-side dependency access

Usually not a fit:

- pure formatting helpers
- app-wide miscellaneous dumping grounds
- server-only dependencies

## 9. Testing

Contexts usually do not need heavy direct tests on their own.

- test context behavior through the provider and consumer hook when that is clearer
- add direct tests only when the context folder owns meaningful logic beyond a simple context definition
- keep tests adjacent to the context concern if they exist

## 10. Example patterns

### Good shared context

```txt
src/shared/contexts/ui-preferences/
├── index.ts
├── types.ts
└── ui-preferences-context.ts
```

Why it fits:

- one context owns one folder
- provider and hook stay out of the context folder
- shared ownership is clear

### Good module context

```txt
src/modules/orders/contexts/order-filters/
├── index.ts
├── order-filters-context.ts
└── types.ts
```

Why it fits:

- context is owned by one module
- the folder contains only the context concern
- provider and hook can evolve independently in their own folders

### Good leaf export

```ts
export { OrderFiltersContext } from "./order-filters-context";
export type { OrderFiltersContextValue } from "./types";
```

## 11. Final checklist

Before adding a context, check:

- does the concern really need React context?
- should it live in a module first, or is it truly shared?
- does one context own one folder?
- is the folder focused on the context object and its contracts only?
- are provider and consumer pieces kept out of `contexts/`?
- are client boundaries explicit?
- are types colocated when the context owns them?
