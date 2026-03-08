---
applyTo: "src/modules/**/containers/**"
---

# Containers Guardrails

Rules for writing container components in `src/modules/<module>/containers/`.

## Required bridge layer

Containers sit between screens and components:
`screen` → `container` → `component`

- screens compose containers
- containers bind logic to presenter components
- components present

## Module-owned only

Use `src/modules/<module>/containers/` — never `src/shared/containers/`.

A container that feels generic enough for shared usually needs to be split
into shared components, hooks, or providers instead.

## Bind, don't own

Containers are bridges, **not** the business logic owner.

### Client containers

Client containers (`"use client"`) must delegate **all** stateful logic
to custom hooks. This is mandatory, even when the logic is only used once.

Zero of these directly in a container file:

- `useImmer`, `useEffect`, `useRef`, `useMemo`, `useCallback`
- any React hook calls except custom hooks from `hooks/`
- inline event handlers with logic (handlers that simply forward to a
  hook function are fine)
- direct `navigator`, `window`, or browser API usage

The container calls custom hooks + invokes actions + maps outputs to
presenter props. Nothing more.

```tsx
// Good — all logic in a custom hook
"use client";

import { CheckoutForm } from "@/modules/checkout/components/checkout-form";
import { useCheckoutForm } from "@/modules/checkout/hooks/use-checkout-form";

export function ContainerFormCheckout() {
  const { errors, handleSubmit, values } = useCheckoutForm();

  return <CheckoutForm errors={errors} onSubmit={handleSubmit} values={values} />;
}
```

```tsx
// Bad — useImmer and inline handler belong in a custom hook
"use client";

import { useImmer } from "use-immer";
import { CopyCommand } from "@/modules/example/components/copy-command";

export function ContainerCopyCommand() {
  const [state, updateState] = useImmer({ copied: false });

  async function handleCopy() {
    await navigator.clipboard.writeText("npm create");
    updateState((draft) => { draft.copied = true; });
  }

  return <CopyCommand isCopied={state.copied} onCopy={handleCopy} />;
}
```

### Server containers

Server containers call `lib/` functions, server actions, and async data
loaders directly. Hooks are not available on the server, so the pattern
is: load data → pass to presenters.

Good server container behavior:

- call lib functions for data loading
- import and invoke server actions
- map loaded data into presenter props
- select which presenters to render

Bad server container behavior:

- large inline data transformation logic (move to `lib/` or `utils/`)
- integration code that belongs in `lib/`

## Server-first default

- keep as server component when binding server data, server actions, or
  server-safe values to presenters
- add `"use client"` only when the container needs hooks, browser APIs,
  or client-only interaction (optimistic UI, URL state, local state)
- do not turn every container into a client component by default
- do not move server data loading into a client container

## Minimal prop drilling

- containers should import their own concern-owned actions and data
- pass only minimal route-boundary inputs (params-derived identifiers)
- avoid forwarding long prop chains from screen to container

## Event handler binding

Both `on*` props and `handle*` implementations follow the three-part
pattern: **prefix** + **event verb** + **target** (optional). The event
verb comes immediately after the prefix.

Enforced by ESLint (`project/enforce-handler-naming`).

```tsx
// Good — handle*/on* with verb first, target last
const { handleSubmitForm, handleClickBack } = useCheckoutForm();
<CheckoutForm onSubmitForm={handleSubmitForm} onClickBack={handleClickBack} />;

// Bad — non-handle* identifiers on on* props
const { submitForm, goBack } = useCheckoutForm();
<CheckoutForm onSubmitForm={submitForm} onClickBack={goBack} />;

// Bad — wrong word order (target before verb)
const { handleFormSubmit } = useCheckoutForm();
<CheckoutForm onFormSubmit={handleFormSubmit} />;
// should be handleSubmitForm / onSubmitForm
```

## Folder structure

Each container lives in its own leaf folder prefixed with `container-`:

```text
src/modules/checkout/containers/container-checkout-form/
├── container-checkout-form.tsx
├── container-checkout-form.test.tsx
├── index.ts
└── types.ts
```

Rules:

- one public container per folder
- folder and main file share the same `container-{name}` name
- leaf-level `index.ts` for the public API
- colocate `types.ts` when the container owns contracts
- tests adjacent to the container
- no parent barrel files for `containers/`

## Naming

Files and folders use kebab-case with `container-` prefix:

- `container-form-checkout`, `container-form-filters-order`

Exported symbols follow the project-wide **UI-type-first, domain-last**
pattern with `Container` prefix, then the UI type, then the domain:

- `container-form-checkout` → `ContainerFormCheckout`
- `container-form-filters-order` → `ContainerFormFiltersOrder`
- `container-header-profile` → `ContainerHeaderProfile`

## Example

Server container:

```tsx
import { updateProfileAction } from "@/modules/profile/actions/update-profile-action";
import { ProfileForm } from "@/modules/profile/components/profile-form";
import { getProfile } from "@/modules/profile/lib/get-profile";

export async function ContainerFormProfile() {
  const profile = await getProfile();

  return (
    <ProfileForm
      defaultDisplayName={profile.displayName}
      defaultEmail={profile.email}
      submitAction={updateProfileAction}
    />
  );
}
```

Client container:

```tsx
"use client";

import { CheckoutForm } from "@/modules/checkout/components/checkout-form";
import { useCheckoutForm } from "@/modules/checkout/hooks/use-checkout-form";

export function ContainerFormCheckout() {
  const { errors, handleSubmit, values } = useCheckoutForm();

  return <CheckoutForm errors={errors} onSubmit={handleSubmit} values={values} />;
}
```

## Leaf index.ts exports

When a `types.ts` file exists in the container folder, `index.ts` must
re-export its types. Value exports come first, type exports come last.

```ts
export { ContainerFormCheckout } from "./container-form-checkout";

export type { ContainerFormCheckoutProps } from "./types";
```

## Checklist

- [ ] Sits between screen and components (bridge layer)
- [ ] Module-owned (not in `src/shared/`)
- [ ] Client containers delegate all logic to custom hooks — zero
      hooks, state, effects, or inline handlers directly in the file
- [ ] Event handlers use `handle` + verb + target, bound to `on` + verb + target props
- [ ] Server containers call lib functions, not inline logic
- [ ] Server-first unless client coordination is truly needed
- [ ] Minimal prop drilling — imports its own concerns
- [ ] Folder prefixed with `container-`
- [ ] Exported symbol uses `Container` prefix
- [ ] `"use client"` only when explicitly required
- [ ] `index.ts` re-exports types from `types.ts` when it exists
- [ ] Value exports before type exports in `index.ts`
