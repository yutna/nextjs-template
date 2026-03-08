# Client-Interactive Flow

This guide covers the client-interactive implementation flow in detail. Use
this approach when the feature needs client coordination such as hooks,
browser APIs, real-time state, or complex interactive behavior that cannot
stay on the server.

## When to use client-interactive flow

Choose the client-interactive flow when:

- The feature requires React hooks for state management or side effects
- Browser APIs are needed (e.g., geolocation, clipboard, media queries)
- The UI needs real-time interactive state that the server cannot manage
- Form behavior requires client-side validation feedback, multi-step flows,
  or optimistic updates
- The interaction model goes beyond simple form submission and navigation

**Important:** Even in a client-interactive feature, the page entry and screen
should stay server-first. Only the container and below should become client
components when needed.

## Flow diagram

```txt
page.tsx
  -> screen
    -> client container
      -> hook
      -> action
      -> component
```

## What this means

- `page.tsx` still stays server-only
- The screen still stays server-first when possible
- The container becomes `"use client"` only when needed
- The hook owns the extracted client logic
- The component remains presenter-oriented
- The action still stays in `actions/`

## Detailed example: checkout feature

This example shows the complete file tree for a client-interactive checkout
feature with a multi-step form.

### File tree

```txt
src/app/[locale]/checkout/page.tsx
  -> src/modules/checkout/screens/screen-checkout/
    -> src/modules/checkout/containers/container-form-checkout/
      -> src/modules/checkout/hooks/use-form-checkout/
      -> src/modules/checkout/actions/submit-checkout-action/
      -> src/modules/checkout/components/form-checkout/
    -> src/modules/checkout/schemas/checkout-input/
    -> src/modules/checkout/lib/submit-checkout/
```

### Layer breakdown

**`src/app/[locale]/checkout/page.tsx`** — Route entry:

- Imports `"server-only"`
- Reads locale from params
- Calls `setRequestLocale(locale)`
- Returns `<ScreenCheckout />` directly
- Stays server-only even though the feature is interactive

**`src/modules/checkout/screens/screen-checkout/`** — Screen:

- Module-level page UI entry
- Composes `ContainerFormCheckout` and any other containers
- Stays server-first when possible
- Does not use `"use client"`

**`src/modules/checkout/containers/container-form-checkout/`** — Container:

- Marked with `"use client"` because it needs hooks
- Binds the checkout hook and action to the form presenter
- Orchestrates the interaction between hook state and the component
- Does not own business logic inline

**`src/modules/checkout/hooks/use-form-checkout/`** — Hook:

- Extracted client logic for the checkout form
- Manages form state, validation feedback, step navigation
- May call the action via `useAction` or similar patterns
- Encapsulates all client-side coordination

**`src/modules/checkout/actions/submit-checkout-action/`** — Action:

- Uses `"use server";`
- Uses `actionClient` or `authActionClient`
- Validates input with the schema
- Calls the lib function to process the checkout

**`src/modules/checkout/components/form-checkout/`** — Component:

- Presenter-oriented UI
- Receives prepared props from the container
- Renders form fields, buttons, and step indicators
- Does not own business logic or data fetching

**`src/modules/checkout/schemas/checkout-input/`** — Schema:

- Zod validation contract for the checkout payload
- May be used by both the action (server validation) and the hook (client
  validation feedback)

**`src/modules/checkout/lib/submit-checkout/`** — Lib:

- Reusable service logic for processing a checkout
- Handles payment integration, order creation, or external service calls
- Called by the action, not by the hook or component directly

## Client-interactive rules

Follow these rules when using the client-interactive flow:

1. Do not move business logic into the component just because the feature is
   interactive
1. Keep `"use client"` at the container level or lower, never at the screen
   or page level
1. The container binds logic to UI — it is the orchestrator
1. The hook encapsulates client logic — it owns state and side effects
1. The component presents — it receives prepared props and renders UI
1. The action still stays server-side in `actions/`
1. `page.tsx` remains server-only with `import "server-only"`

## How hooks, actions, and components fit together

The client-interactive chain follows this pattern:

```txt
container ("use client")
  -> uses hook for client state and logic
  -> calls action for server mutations
  -> passes prepared props to component
```

**Hooks** own extracted client logic. They:

- Live in `hooks/` at the module level
- Are consumed by containers, not by components directly
- Manage form state, validation, optimistic updates, and side effects
- May call actions via patterns like `useAction` from `next-safe-action`

**Actions** remain the server command boundary. They:

- Stay in `actions/` with `"use server";`
- Are called from hooks or containers on the client side
- Validate input with schemas and delegate to lib
- Do not run in the browser

**Components** remain presenter-oriented. They:

- Receive prepared props from the container
- Render UI without owning business logic
- May emit callbacks that the container or hook handles
- Stay focused on presentation, not orchestration

## The separation principle

The most important rule in the client-interactive flow:

> Do not move business logic into the component just because the feature is
> interactive.

Instead, maintain clear separation:

| Layer | Responsibility |
| --- | --- |
| Container | Binds logic to UI, orchestrates |
| Hook | Encapsulates client logic and state |
| Component | Presents UI with prepared props |
| Action | Server command boundary |

When you feel tempted to add state management, data fetching, or mutation
logic directly in a component, stop and move it to the appropriate layer:

- **State and effects** belong in a hook
- **Server mutations** belong in an action
- **Orchestration** belongs in the container
- **Rendering** belongs in the component

## Checklist

Before implementing a client-interactive feature, verify:

- Does `page.tsx` start with `import "server-only"`?
- Does `page.tsx` return exactly one screen?
- Does the screen stay server-first without `"use client"`?
- Is `"use client"` only on the container or lower?
- Is client logic extracted into a hook, not inline in the component?
- Does the action stay in `actions/` with `"use server";`?
- Does the component only receive prepared props and render UI?
- Is business logic kept out of the component layer?
- Does reusable service logic live in `lib/`, not inline in the action?
