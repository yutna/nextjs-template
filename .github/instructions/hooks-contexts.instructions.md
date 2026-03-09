---
applyTo: "src/**/hooks/**,src/**/contexts/**"
---

# Hooks and Contexts

Hooks and contexts are **separate** folder concerns with distinct responsibilities.

## Contexts folder

The `contexts/` folder holds context objects and their owned contracts.

- Create React contexts with `createContext`
- Define the context value contract and related types
- Name files `<concern>-context.ts`
- One context per leaf folder with `index.ts` and optional `types.ts`
- Do **not** place provider components or consumer hooks here

Flow: `contexts/` -> `providers/` -> `hooks/`

## Hooks folder

The `hooks/` folder holds consumer hooks and custom hooks.

- Package reusable client-side state or effect logic behind a `use*` API
- Consumed primarily by containers
- Add `"use client"` at the top of hook implementation files
- Always extract logic into hooks for clarity and testability,
  even if only used once — client containers must not own logic directly
- One hook per leaf folder with `index.ts` and optional `types.ts`
- Keep tests adjacent to the hook they cover

## Event handler return naming

Hooks that return functions intended for containers to bind to component
`on*` event props must use the `handle*` prefix with the three-part
pattern: `handle` + **event verb** + **target** (optional). Non-event
functions (`reset`, `validate`, `refetch`) are exempt.

```ts
// Good — handle + verb + target
function useCheckoutForm() {
  function handleSubmitForm() { /* ... */ }
  function handleClickBack() { /* ... */ }
  function validate() { /* ... */ }  // not an event handler — OK

  return { handleClickBack, handleSubmitForm, validate };
}

// Bad — wrong word order (target before verb)
function useCheckoutForm() {
  function handleFormSubmit() { /* ... */ }  // should be handleSubmitForm
  function handleBackClick() { /* ... */ }   // should be handleClickBack

  return { handleBackClick, handleFormSubmit };
}
```

This convention works together with the container-side ESLint rule
(`project/enforce-handler-naming`) which requires `handle*` identifiers
when binding to `on*` JSX props.

## State management

Always use `useImmer` from `use-immer` — never use `useState`.

- State value is always an **object**: `useImmer({ count: 0 })`
- Maximum **one** `useImmer({})` call per file — if a file needs
  two independent states, unify them into one object or extract
  a separate hook
- For complex state with multiple action types, use
  `useImmerReducer` instead
- Import from `use-immer`, not from React

```tsx
// Good — single object state
const [state, updateState] = useImmer({ query: "", page: 1 });

// Good — complex logic
const [state, dispatch] = useImmerReducer(reducer, initialState);
```

```tsx
// Bad — never use useState
const [count, setCount] = useState(0);

// Bad — multiple useImmer calls in one file
const [filters, updateFilters] = useImmer({ q: "" });
const [pagination, updatePagination] = useImmer({ page: 1 });
```

## SWR integration

Use SWR with the project's `swrFetcher` for client-side data
fetching:

```tsx
import useSWR from "swr";

import { swrFetcher } from "@/shared/lib/fetcher";

const { data, error, isLoading } = useSWR<User>(
  "/api/users/me",
  swrFetcher
);
```

- Always import `swrFetcher` from `@/shared/lib/fetcher`
- Prefer server-side data loading when possible — SWR is for
  cases that genuinely need client-side reactivity
- SWR hooks live in `hooks/`

## Utility hooks

Check `usehooks-ts` before creating a custom hook.

- Import directly: `import { useDebounce } from "usehooks-ts"`
- If `usehooks-ts` provides the exact hook, use it
- If it needs project-specific wrapping, wrap it in a custom hook

## Scope and placement

- **Module-first**: place in `src/modules/<module>/hooks/` or `src/modules/<module>/contexts/`
- **Shared only when truly cross-cutting**: promote to `src/shared/hooks/` or `src/shared/contexts/`
- Do not move feature-owned hooks or contexts into `shared/` too early

## Naming

- Folders: kebab-case (`use-order-filters`, `checkout-flow`)
- Hook exports: camelCase with `use` prefix (`useOrderFilters`)
- Context exports: PascalCase (`OrderFiltersContext`)
- Named exports only, no default exports
- No parent barrel files for `hooks/` or `contexts/` directories

## Folder structure

```txt
src/modules/orders/hooks/use-order-filters/
├── index.ts
├── types.ts
├── use-order-filters.test.ts
└── use-order-filters.ts

src/modules/orders/contexts/order-filters/
├── index.ts
├── order-filters-context.ts
└── types.ts
```

## Key boundaries

- `contexts/` owns the context object only
- `providers/` owns provider components that wrap children
- `hooks/` owns consumer hooks (including `useContext` wrappers) and custom hooks
- `utils/` owns pure React-free helpers
- `lib/` owns infrastructure and integrations

## Hooks design rules

- One clear responsibility per hook
- Keep APIs small with focused parameter lists and object returns
- Compose smaller hooks instead of growing one large hook
- Do not import server-only modules into hooks
- Move pure helper logic into `utils/` when React is not required

## Context design rules

- One clear responsibility per context
- Prefer multiple focused contexts over one oversized global context
- Use context only when props or a plain hook are no longer a good fit
- Place `"use client"` in context implementation files when required
- Keep server data preparation outside the context folder

## Checklist

- [ ] Is it a context object? -> `contexts/`. A consumer hook? -> `hooks/`
- [ ] Module-first scope before promoting to `shared/`
- [ ] One hook or context per leaf folder
- [ ] Named exports only
- [ ] Event handler returns use `handle` + verb + target pattern
- [ ] `"use client"` present where needed
- [ ] Tests adjacent to the hook they cover
- [ ] No parent barrel files
- [ ] Types colocated when owned by the hook or context
- [ ] `index.ts` re-exports types from `types.ts` when it exists
- [ ] Value exports before type exports in `index.ts`
