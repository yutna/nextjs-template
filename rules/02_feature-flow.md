# Common Feature Implementation Flow

This guide explains the common implementation flow for building a feature in this repository.

It is a synthesis document that connects the existing rules for:

- `page.tsx`
- `screens/`
- `containers/`
- `components/`
- `actions/`
- `hooks/`
- `schemas/`
- `lib/`
- `layouts/`
- and supporting shared layers such as `config/`, `constants/`, `providers/`, and `contexts/`

Use this document as the high-level architecture reference when deciding where new code should live.

## 1. Core idea

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

## 2. Primary layer responsibilities

### `page.tsx`

- server-only route entry
- one `page.tsx` returns one screen directly
- handles route-entry concerns such as params handoff and locale setup

### `screens/`

- module-level page UI entry
- one screen belongs to one `page.tsx`
- composes containers only
- stays server-first by default

### `containers/`

- required bridge layer beneath screens
- binds logic to presenter components
- may be server or client depending on the binding need
- should stay self-contained with minimal prop drilling

### `components/`

- presenter-oriented UI
- stateless or logic-light
- receives prepared props

### `actions/`

- server action definitions
- use `"use server";`
- use `actionClient` or `authActionClient`

### `hooks/`

- extracted client logic
- consumed by containers
- not the home of route-entry or presenter composition

### `schemas/`

- Zod validation contracts
- shared or module-owned depending on ownership

### `lib/`

- reusable integrations, service boundaries, and architecture-level logic
- not action definitions, not presenter UI

## 3. End-to-end overview diagram

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
2. the page returns one screen
3. the screen assembles one or more containers
4. each container binds logic to presenter components
5. containers may use hooks and actions
6. actions validate input with schemas and call into lib when needed

## 4. Server-first flow

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

### What this means

- `page.tsx` stays thin and server-only
- the screen remains server-first
- the container may remain a server component
- the component renders a presenter UI
- the action stays in `actions/`
- reusable service behavior lives in `lib/`

### Example shape

```txt
src/app/[locale]/profile/page.tsx
  -> src/modules/profile/screens/screen-profile/
    -> src/modules/profile/containers/container-form-profile/
      -> src/modules/profile/components/form-profile/
    -> src/modules/profile/actions/update-profile-action/
    -> src/modules/profile/schemas/update-profile-input/
    -> src/modules/profile/lib/update-profile/
```

### Server-first rule

Do not introduce client code unless the interaction truly needs it.

If the binding can stay on the server:

- keep the container server-side
- let the action remain server-side
- let the presenter component receive prepared props

## 5. Client-interactive flow

Use this flow when the feature needs client coordination.

```txt
page.tsx
  -> screen
    -> client container
      -> hook
      -> action
      -> component
```

### What this means

- `page.tsx` still stays server-only
- the screen still stays server-first when possible
- the container becomes `"use client"` only when needed
- the hook owns the extracted client logic
- the component remains presenter-oriented
- the action still stays in `actions/`

### Example shape

```txt
src/app/[locale]/checkout/page.tsx
  -> src/modules/checkout/screens/screen-checkout/
    -> src/modules/checkout/containers/container-form-checkout/
      -> src/modules/checkout/hooks/use-form-checkout/
      -> src/modules/checkout/actions/submit-checkout-action/
      -> src/modules/checkout/components/form-checkout/
```

### Client-interactive rule

Do not move business logic into the component just because the feature is interactive.

Instead:

- container binds
- hook encapsulates client logic
- component presents

## 6. Relationship to App Router boundaries

App Router files still keep their own responsibilities.

### `page.tsx`

- route entry
- server-only
- returns one screen directly
- handles locale setup where required

### `layout.tsx`

- route or segment boundary layout concerns
- reusable visual structure should still move into `shared/layouts` or `modules/<module>/layouts`
- `src/app/[locale]/layout.tsx` owns locale-boundary setup such as `setRequestLocale(locale)` and locale-aware providers

### `loading.tsx`, `error.tsx`, `template.tsx`

- stay in `app/`
- do not replace them with screen or container patterns

## 7. Supporting layers and where they fit

### `schemas/`

Use schemas for:

- action input validation
- search param validation
- route param validation
- form payload validation

They usually support:

```txt
action -> schema
```

or

```txt
page/screen -> schema
```

when validating route-shaped inputs.

### `lib/`

Use lib for:

- reusable integrations
- service boundaries
- framework wrappers
- infrastructure-aware logic

It usually sits behind actions or other server-side flows:

```txt
action -> lib
```

### `hooks/`

Use hooks for:

- extracted client logic
- browser-aware interaction logic
- reusable UI state

They usually sit beneath containers:

```txt
container -> hook
```

### `layouts/`

Use layouts for:

- reusable structural framing
- shared page chrome
- route-family shells

They sit around page flows, not inside the action chain.

### `config/` and `constants/`

Use these for:

- app-wide configuration
- static shared values

These layers support other layers but are not normally the center of feature flow.

## 8. Recommended build order for a new feature

When implementing a new feature, this order usually keeps the architecture clean:

1. define the route entry need in `page.tsx`
2. define the screen for that page
3. define the containers the screen needs
4. define presenter components beneath the containers
5. define actions for mutations
6. define schemas for validation
7. extract reusable service logic into `lib/`
8. extract client logic into hooks if interaction requires it

This is not a rigid time sequence for every task, but it is a useful architectural order.

## 9. Practical diagrams

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

## 10. Common mistakes to avoid

Avoid these architecture mistakes:

- `page.tsx` assembling containers directly
- screens rendering presenter components directly as the main pattern
- containers owning business logic inline
- components becoming mini controllers
- actions embedding reusable service logic that belongs in `lib/`
- hooks becoming the home of server-side behavior
- route-boundary App Router responsibilities leaking into screens or containers

## 11. Quick reference

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

## 12. Related topics

Use this document together with the more specific topics for:

- page entry files
- screens
- containers
- components
- actions
- hooks
- layouts
- schemas
- shared lib code

This document explains the common flow. The narrower topics still define the detailed standards for each folder or file type.
