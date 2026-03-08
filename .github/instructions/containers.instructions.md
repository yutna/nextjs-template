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

Good container behavior:

- call custom hooks
- import and invoke actions
- map hook outputs into presenter props
- load concern-owned data to stay self-contained
- select which presenters to render

Bad container behavior:

- large inline business rule implementations
- duplicated domain logic from hooks or actions
- integration code that belongs in `lib/`
- deeply nested state machines built inline

If the container starts owning the logic instead of binding it, extract that
logic into `hooks/`, `actions/`, or `lib/`.

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

- `container-checkout-form`, `container-order-filters`

Exported symbols use PascalCase with `Container` prefix, followed by the
UI type, then the domain (UI-first, domain-last):

- `container-checkout-form` → `ContainerFormCheckout`
- `container-order-filters` → `ContainerFormFiltersOrder`
- `container-profile-header` → `ContainerHeaderProfile`

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

import { submitCheckoutAction } from "@/modules/checkout/actions/submit-checkout-action";
import { CheckoutForm } from "@/modules/checkout/components/checkout-form";
import { useCheckoutForm } from "@/modules/checkout/hooks/use-checkout-form";

export function ContainerFormCheckout() {
  const form = useCheckoutForm({ submitAction: submitCheckoutAction });

  return <CheckoutForm {...form} />;
}
```

## Checklist

- [ ] Sits between screen and components (bridge layer)
- [ ] Module-owned (not in `src/shared/`)
- [ ] Binds existing logic, not implementing business rules inline
- [ ] Server-first unless client coordination is truly needed
- [ ] Minimal prop drilling — imports its own concerns
- [ ] Folder prefixed with `container-`
- [ ] Exported symbol uses `Container` prefix
- [ ] `"use client"` only when explicitly required
