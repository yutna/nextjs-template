---
name: project-feature-flow
description: >
  Complete feature implementation guide for this project. Use when building a new
  feature end-to-end, creating a new module, or implementing a multi-file change
  that spans page entry, screen, container, component, action, and schema layers.
  Covers the recommended build order, server-first and client-interactive flows,
  and the relationship between all architectural layers.
---

# Project Feature Implementation Flow

This guide explains the common implementation flow for building a feature in
this repository.

It connects the existing rules for `page.tsx`, `screens/`, `containers/`,
`components/`, `actions/`, `hooks/`, `schemas/`, `lib/`, `layouts/`, and
supporting shared layers such as `config/`, `constants/`, `providers/`, and
`contexts/`.

Use this document as the high-level architecture reference when deciding where
new code should live.

## Core idea

This repository uses a layered, server-first feature flow.

The most common UI path is:

```txt
page.tsx -> screen -> container -> component
```

And the most common action/data path is:

```txt
action -> container -> component
```

Supporting layers sit beside that flow:

- `schemas/` define validation contracts
- `lib/` owns reusable integrations and service boundaries
- `hooks/` own extracted client logic
- `layouts/` own reusable framing
- `config/` and `constants/` provide app-wide setup and static values

## Primary layer responsibilities

### `page.tsx`

- Server-only route entry
- One `page.tsx` returns one screen directly
- Handles route-entry concerns such as params handoff and locale setup

### `screens/`

- Module-level page UI entry
- One screen belongs to one `page.tsx`
- Composes containers only
- Stays server-first by default

### `containers/`

- Required bridge layer beneath screens
- Binds logic to presenter components
- May be server or client depending on the binding need
- Should stay self-contained with minimal prop drilling

### `components/`

- Presenter-oriented UI
- Stateless or logic-light
- Receives prepared props

### `actions/`

- Server action definitions
- Use `"use server";`
- Use `actionClient` or `authActionClient`

### `hooks/`

- Extracted client logic
- Consumed by containers
- Not the home of route-entry or presenter composition

### `schemas/`

- Zod validation contracts
- Shared or module-owned depending on ownership

### `lib/`

- Reusable integrations, service boundaries, and architecture-level logic
- Not action definitions, not presenter UI

## End-to-end overview diagram

```txt
app/**/layout.tsx
  -> route / segment boundary
  -> locale boundary setup when needed

app/**/page.tsx
  -> server-only route entry
  -> returns one Screen*

modules/<module>/screens/screen-*/
  -> Screen*
  -> assembles one or more Container*

modules/<module>/containers/container-*/
  -> Container*
  -> binds logic to presenter components
  -> may use hooks
  -> may call actions

modules/<module>/components/*
  -> presenter UI

shared/actions or modules/<module>/actions
  -> *Action
  -> inputSchema(...)
  -> server command boundary
    -> schemas/
    -> lib/
```

Read it like this:

1. `page.tsx` enters the route
1. The page returns one screen
1. The screen assembles one or more containers
1. Each container binds logic to presenter components
1. Containers may use hooks and actions
1. Actions validate input with schemas and call into lib when needed

## Server-first flow

Use this flow when the feature is mostly server-driven.

```txt
page.tsx
  -> screen
    -> server container
      -> component
    -> action
      -> schema
      -> lib
```

**What this means:**

- `page.tsx` stays thin and server-only
- The screen remains server-first
- The container may remain a server component
- The component renders a presenter UI
- The action stays in `actions/`
- Reusable service behavior lives in `lib/`

**Example shape:**

```txt
src/app/[locale]/profile/page.tsx
  -> src/modules/profile/screens/screen-profile/
    -> src/modules/profile/containers/container-form-profile/
      -> src/modules/profile/components/form-profile/
    -> src/modules/profile/actions/update-profile-action/
    -> src/modules/profile/schemas/update-profile-input/
    -> src/modules/profile/lib/update-profile/
```

**Server-first rule:** Do not introduce client code unless the interaction
truly needs it. If the binding can stay on the server, keep the container
server-side, let the action remain server-side, and let the presenter
component receive prepared props.

See [references/server-flow.md](references/server-flow.md) for the full
server-first guide.

## Client-interactive flow

Use this flow when the feature needs client coordination.

```txt
page.tsx
  -> screen
    -> client container
      -> hook
      -> action
      -> component
```

**What this means:**

- `page.tsx` still stays server-only
- The screen still stays server-first when possible
- The container becomes `"use client"` only when needed
- The hook owns the extracted client logic
- The component remains presenter-oriented
- The action still stays in `actions/`

**Example shape:**

```txt
src/app/[locale]/checkout/page.tsx
  -> src/modules/checkout/screens/screen-checkout/
    -> src/modules/checkout/containers/container-form-checkout/
      -> src/modules/checkout/hooks/use-form-checkout/
      -> src/modules/checkout/actions/submit-checkout-action/
      -> src/modules/checkout/components/form-checkout/
```

**Client-interactive rule:** Do not move business logic into the component
just because the feature is interactive. Instead: container binds, hook
encapsulates client logic, component presents.

See [references/client-flow.md](references/client-flow.md) for the full
client-interactive guide.

## Relationship to App Router boundaries

App Router files still keep their own responsibilities.

### `page.tsx` in App Router

- Route entry, server-only
- Returns one screen directly
- Handles locale setup where required

### `layout.tsx` in App Router

- Route or segment boundary layout concerns
- Reusable visual structure should move into `shared/layouts` or
  `modules/<module>/layouts`
- `src/app/[locale]/layout.tsx` owns locale-boundary setup such as
  `setRequestLocale(locale)` and locale-aware providers

### `loading.tsx`, `error.tsx`, `template.tsx`

- Stay in `app/`
- Do not replace them with screen or container patterns

## Supporting layers and where they fit

### `schemas/` as support layer

Use schemas for:

- Action input validation
- Search param validation
- Route param validation
- Form payload validation

They usually support:

```txt
action -> schema
```

Or when validating route-shaped inputs:

```txt
page/screen -> schema
```

### `lib/` as support layer

Use lib for:

- Reusable integrations
- Service boundaries
- Framework wrappers
- Infrastructure-aware logic

It usually sits behind actions or other server-side flows:

```txt
action -> lib
```

### `hooks/` as support layer

Use hooks for:

- Extracted client logic
- Browser-aware interaction logic
- Reusable UI state

They usually sit beneath containers:

```txt
container -> hook
```

### `layouts/`

Use layouts for:

- Reusable structural framing
- Shared page chrome
- Route-family shells

They sit around page flows, not inside the action chain.

### `config/` and `constants/`

Use these for:

- App-wide configuration
- Static shared values

These layers support other layers but are not normally the center of feature
flow.

## Recommended build order for a new feature

When implementing a new feature, this order usually keeps the architecture
clean:

1. Define the route entry need in `page.tsx`
1. Define the screen for that page
1. Define the containers the screen needs
1. Define presenter components beneath the containers
1. Define actions for mutations
1. Define schemas for validation
1. Extract reusable service logic into `lib/`
1. Extract client logic into hooks if interaction requires it

This is not a rigid time sequence for every task, but it is a useful
architectural order.

## Practical diagrams

### Minimal page rendering flow

```txt
page.tsx
  -> Screen*
    -> Container*
      -> Component*
```

### Action-backed interactive flow

```txt
Screen*
  -> Container*
    -> useSomething()
    -> someAction()
    -> Component*

someAction()
  -> input schema
  -> lib function
```

### Locale-aware route flow

```txt
app/[locale]/layout.tsx
  -> locale boundary setup
app/[locale]/page.tsx
  -> Screen*
    -> Container*
      -> Component*
```

## Common mistakes to avoid

Avoid these architecture mistakes:

- `page.tsx` assembling containers directly
- Screens rendering presenter components directly as the main pattern
- Containers owning business logic inline
- Components becoming mini controllers
- Actions embedding reusable service logic that belongs in `lib/`
- Hooks becoming the home of server-side behavior
- Route-boundary App Router responsibilities leaking into screens or containers

## Quick reference

Use this quick map when deciding where code belongs:

```txt
Route entry?                -> page.tsx
Module-level page UI?       -> screens/
Logic binding?              -> containers/
Presenter UI?               -> components/
Server action?              -> actions/
Client interaction logic?   -> hooks/
Validation contract?        -> schemas/
Reusable service logic?     -> lib/
Reusable structural frame?  -> layouts/
App setup/static values?    -> config/ or constants/
```
