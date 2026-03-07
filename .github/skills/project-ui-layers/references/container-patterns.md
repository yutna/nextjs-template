# Container Patterns

This reference defines how to write and organize container components inside
`src/modules/<module-name>/containers`.

Use `containers/` for module-owned bridge layers that bind logic to presenter
components. In this architecture, screens compose containers, and containers
compose presenter components. A container is not the home of the business logic
itself. Instead, it composes existing hooks, actions, and prepared server data
into a UI-facing shape that presenter components can consume cleanly.

## 1. Decide whether code belongs in containers

Put code in a `containers` folder when it does one or more of the following:

- binds prepared logic to one or more presenter components
- coordinates a self-contained interactive UI concern inside one module
- adapts hook outputs into component props
- connects server-provided inputs, actions, or identifiers to client-side
  interaction
- keeps orchestration out of `components/` while avoiding business logic
  directly inside
  the container

Examples:

- a checkout form container that binds a form hook to a presenter form component
- an order filters container that binds URL state and selection logic to filter
  presenters
- a profile editor container that wires save actions, local draft state, and
  presenter sections

Do **not** put code in `containers` when it belongs somewhere more specific:

- `app/**` route files for `loading.tsx`, `error.tsx`, `template.tsx`, route
  `layout.tsx`,
  metadata, and other route-boundary behavior
- `screens/` for module-level page or route assembly
- `components/` for presenter-only rendering
- `hooks/` for extracted client logic
- `actions/` for server actions
- `lib/` for integrations and architectural services

Rule of thumb:

- if the file mainly binds prepared logic to presenter components, `containers/`
  is usually
  correct
- if the file mainly defines the logic itself, it likely belongs in `hooks/`,
  `actions/`,
  `lib/`, or another logic-owning layer

## 2. Containers are module-only

Containers are a feature-level pattern.

Use:

- `src/modules/<module-name>/containers`

Do **not** use:

- `src/shared/containers`

Why:

- containers are usually shaped by one module's workflows, presenter components,
  and hook APIs
- a container that becomes generic enough for `shared` usually wants to be split
  into shared
  components, hooks, or providers instead

Keep ownership local to the module that owns the interaction flow.

## 3. Reinterpret the pattern for App Router

Containers still make sense in App Router, but they should be reinterpreted for
a server-first architecture rather than copied as a purely client-era pattern.

Keep this boundary clear:

- `app/**` owns route-boundary framework features
- `screens/` own module-level UI entry and page assembly
- `containers/` are the required binding layer beneath screens
- `components/` present
- `hooks/` own extracted client logic

Recommended direction:

```text
app route file → screen → container → component
```

That means:

- keep `loading.tsx`, `error.tsx`, `template.tsx`, route `layout.tsx`, metadata,
  params,
  redirects, and route validation in `app/`
- keep screens server-first by default
- let screens compose containers rather than presenter components directly
- use server or client containers depending on the binding needs
- do not move route-boundary framework behavior out of `app/`

The pattern still works, but it must be subordinate to App Router rather than
competing with it.

## 4. Server-first default

This repository aims to use server-side Next.js and React 19 features seriously
and keep client code minimal.

Because of that:

- do not move server data loading into a client container
- do not turn every container into a client component by default
- do not pull server actions or server data into hooks just to satisfy the
  container layer

Use a client container when client coordination is truly needed, for example:

- local interactive state
- browser APIs
- optimistic UI
- URL state binding
- client-only interaction hooks
- multi-part presenter coordination that would otherwise leak into components

If the concern is mostly server-side, keep the container as a server component
and let it bind server-loaded data or server actions to presenter components
without introducing unnecessary client code.

## 5. Keep business logic out of the container

The container is a bridge, not the business logic owner.

Prefer minimal prop drilling into containers.

Prefer this split:

- `hooks/` own extracted client logic
- `actions/` own server mutations
- `lib/` owns integrations and service boundaries
- `containers/` bind those pieces to presenters

Good container behavior:

- call custom hooks
- select which presenters to render
- map hook outputs into presenter props
- load or import concern-owned inputs when that keeps the container self-
  contained
- pass prepared values into hooks or presenters
- keep the binding readable and self-contained

Avoid:

- large business rule implementations inside the container
- duplicated domain logic copied from hooks or actions
- integration code directly inside the container
- deeply nested state machines built inline in the container file
- forwarding long prop chains from screen to container when the container can
  own that
  concern itself

If the container starts owning the logic instead of binding it, extract that
logic out.

## 6. Relationship with screens, components, and hooks

This guide stays focused on `containers`, so nearby layers are mentioned here
only to define the boundary.

### Screens

- screen is the module-level route or page entry
- screen assembles the page and can stay server-first
- screen composes containers, not presenter components directly

### Components

- components are presenter-oriented and logic-light
- components should receive prepared props from the container
- components should not absorb orchestration just because no container exists
  yet

### Hooks

- hooks hold extracted client logic
- containers consume hooks
- do not define reusable hooks inside the container file

Recommended responsibility split:

- screens assemble
- containers coordinate and bind
- components present
- hooks encapsulate client logic

## 7. File and folder structure

Follow the repository's kebab-case convention for files and folders.

Each public container should live in its own leaf folder:

```text
src/modules/checkout/containers/container-checkout-form/
├── container-checkout-form.tsx
├── container-checkout-form.test.tsx
├── index.ts
└── types.ts

src/modules/orders/containers/container-order-filters/
├── container-order-filters.tsx
├── index.ts
└── types.ts
```

Rules:

- keep one public container per folder
- prefix the folder and main implementation file with `container-`
- add a leaf-level `index.ts` for the public API
- colocate `types.ts` when the container owns reusable contracts
- keep tests adjacent to the container they cover
- keep only container-specific adapter helpers inside the same folder
- do not colocate reusable hook definitions inside the container folder
- do not create parent barrel files for `src/modules/<module-name>/containers`

If helper code becomes reusable or grows into real logic ownership, move it to
`hooks/`, `utils/`, `actions/`, or `lib/`.

## 8. Naming

Use specific kebab-case folder and file names:

- `container-checkout-form`
- `container-order-filters`
- `container-profile-editor`

Avoid vague names such as:

- `container`
- `main-container`
- `common-container`
- `wrapper`
- `binding`

For exported symbols:

- use PascalCase names prefixed with `Container`
- derive the name from the concern, not from the route path

Examples:

- `ContainerFormCheckout`
- `ContainerFiltersOrder`
- `ContainerEditorProfile`

## 9. Client and server boundaries

Containers may be server or client components depending on the binding they
perform.

- keep containers as server components by default when they only bind server-
  fetched data,
  server actions, or server-safe values to presenter components
- add `"use client"` only when the container consumes hooks, browser APIs, or
  client-only
  interaction
- prefer importing concern-owned actions and loading concern-owned server data
  inside the
  container when that keeps the container self-contained
- pass only minimal route-boundary inputs into the container when they are truly
  needed,
  such as params-derived identifiers
- do not import server-only modules into a client container

Typical server-first pattern:

1. a route file delegates to a module screen
1. the screen renders one or more containers with only the minimal boundary
   inputs they need
1. the container imports or loads the concern-owned data, actions, and hooks it
   is responsible
   for binding
1. the container either binds server-side values directly or consumes hooks when
   client
   interaction is needed
1. the container renders presenter components

## 10. Example direction

### Good server-first flow

```tsx
// screen-checkout.tsx
import { ContainerFormCheckout } from "@/modules/checkout/containers/container-checkout-form";

export async function CheckoutScreen() {
  return <ContainerFormCheckout />;
}
```

```tsx
// container-checkout-form.tsx
"use client";

import { submitCheckoutAction } from "@/modules/checkout/actions/submit-checkout-action";
import { CheckoutForm } from "@/modules/checkout/components/checkout-form";
import { useCheckoutForm } from "@/modules/checkout/hooks/use-checkout-form";
import { useCheckoutInitialValues } from "@/modules/checkout/hooks/use-checkout-initial-values";

export function ContainerFormCheckout() {
  const initialValues = useCheckoutInitialValues();
  const form = useCheckoutForm({
    initialValues,
    submitAction: submitCheckoutAction,
  });

  return <CheckoutForm {...form} />;
}
```

### Good server container direction

```tsx
// screen-profile.tsx
import { ContainerFormProfile } from "@/modules/profile/containers/container-profile-form";

export async function ProfileScreen() {
  return <ContainerFormProfile />;
}
```

```tsx
// container-profile-form.tsx
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

```tsx
// profile-form.tsx
import type { ProfileFormProps } from "./types";

export function ProfileForm({
  defaultDisplayName,
  defaultEmail,
  submitAction,
}: Readonly<ProfileFormProps>) {
  return (
    <form action={submitAction}>
      <input defaultValue={defaultDisplayName} name="displayName" />
      <input defaultValue={defaultEmail} name="email" type="email" />
      <button type="submit">Save</button>
    </form>
  );
}
```

This is still a container pattern:

- the screen stays responsible for server loading
- the container binds server data and a server action to a presenter form
- the presenter component renders the form
- no `"use client"` is needed unless client interaction is added later

## 11. Checklist

Before adding a file to `src/modules/<module-name>/containers`, check:

- does this screen delegate UI binding through a container instead of rendering
  presenters
  directly?
- is this concern module-owned rather than shared?
- is the container binding existing logic rather than implementing the business
  logic itself?
- should the real logic live in `hooks/`, `actions/`, `lib/`, or another folder?
- are App Router route-boundary concerns still staying in `app/`?
- is the folder name specific and prefixed with `container-`?
- is the exported symbol a clear `Container*` name?
- are client boundaries explicit and minimal when `"use client"` is needed?
