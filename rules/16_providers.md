# Providers Folder Style Guide

This guide defines how to write and organize provider components inside:

- `src/shared/providers`
- `src/modules/<module-name>/providers`

Use these folders for provider components that expose one concern or compose multiple providers at a higher boundary.

## 1. Decide whether code belongs in `providers`

Put code in a `providers` folder when it does one or more of the following:

- renders a provider component
- wires a context provider around `children`
- composes multiple providers into one boundary component
- exposes a subtree-level provider API for app or feature code

Examples:

- app provider composition
- feature-level provider for one context concern
- route-level provider wrapper for a feature subtree

Do **not** put code in `providers` when it belongs somewhere more specific:

- `contexts/` for the context object itself
- `hooks/` for consumer hooks and other custom hooks
- `lib/` for infrastructure or integration code
- UI folders when the file is primarily rendering and not providing subtree state or dependencies

Rule of thumb:

- if the file's main job is wrapping `children` in one or more providers, `providers/` is usually correct
- if the file defines the context primitive, it belongs in `contexts/`

## 2. Scope and placement

Choose the narrowest valid scope first.

### `src/modules/<module-name>/providers`

Prefer module-level providers when the provider is owned by one feature module.

Good fits:

- order filters provider
- checkout flow provider
- profile editor provider

Examples:

- `src/modules/orders/providers/order-filters-provider/`
- `src/modules/checkout/providers/checkout-flow-provider/`

### `src/shared/providers`

Promote a provider to shared only when it is truly cross-module or app-wide.

Good fits:

- `app-provider`
- shared UI preferences provider
- shared composition providers used by unrelated features

Examples:

- `src/shared/providers/app-provider/`
- `src/shared/providers/ui-preferences-provider/`

Avoid moving feature-owned providers into `shared` too early. Promote only when:

- multiple unrelated modules need the same provider
- the provider API is generic rather than feature-specific
- shared ownership improves clarity more than it increases indirection

## 3. Boundaries with other folders

This guide stays focused on `providers`, so adjacent folders are mentioned here only to define the boundary.

- use `providers/` for provider components
- use `contexts/` for context objects and context-owned contracts
- use `hooks/` for consumer hooks
- use `layouts/` or route boundaries to place providers where they should wrap UI

Recommended flow:

`contexts/` -> `providers/` -> `hooks/`

The provider depends on the context. Consumers depend on hooks. Rendering layers depend on providers.

## 4. File and folder structure

Follow the repository's kebab-case convention for files and folders.

Each provider should live in its own leaf folder:

```txt
src/shared/providers/app-provider/
├── app-provider.tsx
├── index.ts
└── types.ts

src/modules/orders/providers/order-filters-provider/
├── index.ts
├── order-filters-provider.tsx
└── types.ts
```

Rules:

- keep one public provider per folder
- name the folder and main implementation file the same
- add a leaf-level `index.ts` for the provider folder
- colocate `types.ts` when the provider owns reusable contracts
- keep tests adjacent to the provider they cover
- do not create parent barrel files for `src/shared/providers` or `src/modules/<module-name>/providers`
- keep provider composition helpers inside the same folder when they are private to that provider

## 5. Naming

Provider names should describe the concern they provide.

Prefer:

- `app-provider`
- `ui-preferences-provider`
- `order-filters-provider`
- `checkout-flow-provider`

Avoid:

- `provider`
- `shared-provider`
- `common-provider`
- `context-provider`

For exported symbols:

- use PascalCase provider component names such as `AppProvider` and `OrderFiltersProvider`
- keep names meaningful when imported elsewhere

## 6. Client boundaries

Provider components in this codebase should be treated as client-side boundaries.

- place `"use client"` at the top of provider implementation files when required
- keep provider logic in the client layer
- do not import server-only modules into providers
- pass server-prepared data into providers through explicit props

If a provider needs server-derived initial data:

- prepare the data before the provider boundary
- pass it through typed props
- keep the provider focused on client-side sharing and composition

## 7. Provider design rules

Providers should stay narrow and intentional.

- keep one clear responsibility per provider
- compose multiple providers only when a higher-level boundary truly needs one entry point
- keep provider props explicit
- avoid turning one provider into a dumping ground for unrelated concerns

Good fits:

- wrapping one context concern
- composing app-wide providers in one top-level provider
- exposing one feature subtree state boundary

Usually not a fit:

- pure rendering wrappers with no provider responsibility
- infrastructure code
- raw context definitions

## 8. TypeScript rules

Match the repository's strict TypeScript style.

- type provider props clearly
- keep provider-owned contracts in local `types.ts`
- use `interface` for object-shaped provider props
- use `import type` for type-only imports

Good fits for provider-local `types.ts`:

- provider props
- composition-specific prop contracts

Do not move provider-owned contracts into `src/shared/types` unless they become truly cross-cutting and are no longer clearly owned by one provider.

## 9. Relationship to `contexts/`

Providers should consume context primitives from `contexts/` rather than redefining them.

Good direction:

```txt
src/modules/orders/contexts/order-filters/
└── order-filters-context.ts

src/modules/orders/providers/order-filters-provider/
└── order-filters-provider.tsx
```

The provider owns provider behavior. The context folder owns the context object.

## 10. Testing

Every non-trivial provider should have adjacent tests.

- use Vitest and Testing Library
- test the provider through consumer behavior where practical
- verify that provider props seed state correctly
- test composition providers by checking that children render within the expected provider boundary

Typical provider tests should cover:

- children rendering
- initial prop handling
- provider updates exposed through consumers
- composition behavior for multi-provider wrappers

## 11. Example patterns

### Good shared provider

```txt
src/shared/providers/app-provider/
├── app-provider.tsx
├── index.ts
└── types.ts
```

Why it fits:

- app-wide ownership is clear
- one provider concern owns one folder
- composition is explicit

### Good module provider

```txt
src/modules/orders/providers/order-filters-provider/
├── index.ts
├── order-filters-provider.tsx
└── types.ts
```

Why it fits:

- provider is owned by one module
- it stays separate from the raw context definition
- the boundary is clear to consumers

### Good leaf export

```ts
export { OrderFiltersProvider } from "./order-filters-provider";
export type { OrderFiltersProviderProps } from "./types";
```

## 12. Final checklist

Before adding a provider, check:

- is the file really a provider component?
- should it live in a module first, or is it truly shared?
- does one provider own one folder?
- is it separate from the raw context definition?
- are client boundaries explicit?
- are props typed clearly?
- are tests covering provider behavior or composition?
