---
applyTo: "src/**/providers/**"
---

# Providers

Provider components are **separate** from contexts. Contexts hold context objects;
providers hold provider components that wrap `children`.

## What belongs in providers

- Provider components that wire a context provider around `children`
- Composition providers that combine multiple providers at a boundary
- Subtree-level provider APIs for app or feature code

Do **not** place here:

- Context objects (`createContext`) -> use `contexts/`
- Consumer hooks -> use `hooks/`
- Infrastructure or integration code -> use `lib/`

## Flow

```txt
contexts/ -> providers/ -> hooks/
```

The provider depends on the context. Consumers depend on hooks.

## Scope and placement

- **Module-first**: place in `src/modules/<module>/providers/`
- **Shared only when truly cross-cutting**: promote to `src/shared/providers/`
- Do not move feature-owned providers into `shared/` too early

## Folder structure

Each provider lives in its own leaf folder:

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

- One public provider per folder
- Name the folder and main file the same
- Leaf-level `index.ts` for each provider folder
- Colocate `types.ts` when the provider owns its prop contracts
- No parent barrel files for `providers/` directories
- Keep tests adjacent to the provider they cover

## Naming

- Folders: kebab-case with `-provider` suffix (`app-provider`, `order-filters-provider`)
- Exports: PascalCase (`AppProvider`, `OrderFiltersProvider`)
- Named exports only, no default exports

## Client boundaries

- Place `"use client"` at the top of provider implementation files when required
- Do not import server-only modules into providers
- Pass server-prepared data into providers through explicit typed props
- Keep the provider focused on client-side sharing and composition

## Design rules

- One clear responsibility per provider
- Compose multiple providers only when a higher-level boundary needs one entry point
- Keep provider props explicit and typed
- Do not turn one provider into a dumping ground for unrelated concerns
- Consume context primitives from `contexts/` rather than redefining them

## Leaf export example

When a `types.ts` file exists, `index.ts` must re-export its types.
Value exports come first, type exports come last.

```ts
export { OrderFiltersProvider } from "./order-filters-provider";

export type { OrderFiltersProviderProps } from "./types";
```

## Checklist

- [ ] Is this file really a provider component, not a context or hook?
- [ ] Module-first scope before promoting to `shared/`
- [ ] One provider per leaf folder
- [ ] Separate from the raw context definition in `contexts/`
- [ ] `"use client"` present where needed
- [ ] Props typed clearly in `types.ts`
- [ ] Named exports only
- [ ] No parent barrel files
- [ ] `index.ts` re-exports types from `types.ts` when it exists
- [ ] Value exports before type exports in `index.ts`
- [ ] Tests covering provider behavior or composition
