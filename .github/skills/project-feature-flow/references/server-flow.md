# Server-First Flow

This guide covers the server-first implementation flow in detail. Use this
approach when the feature is mostly server-driven and does not require client
coordination such as hooks, browser APIs, or complex interactive state.

## When to use server-first flow

Choose the server-first flow when:

- The feature renders data that can be loaded and prepared on the server
- Mutations can be handled through server actions without client orchestration
- The UI does not need hooks, browser APIs, or real-time client state
- Data loading happens naturally in a server component or server action
- The interaction model is form submission, navigation, or page render

Ask these questions before reaching for client code:

- Can this stay on the server?
- Can data loading happen in a server component instead of a client effect?
- Can this mutation use a server action instead of a client-only API wrapper?
- Can this value be derived on the server and passed down as rendered output?
- Can interactivity be isolated to a smaller client leaf instead of making the
  whole tree client-side?

## Flow diagram

```txt
page.tsx
  -> screen
    -> server container
      -> component
    -> action
      -> schema
      -> lib
```

## What this means

- `page.tsx` stays thin and server-only
- The screen remains server-first
- The container may remain a server component
- The component renders a presenter UI with prepared props
- The action stays in `actions/`
- Reusable service behavior lives in `lib/`

## Detailed example: profile feature

This example shows the complete file tree for a server-first profile update
feature.

### File tree

```txt
src/app/[locale]/profile/page.tsx
  -> src/modules/profile/screens/screen-profile/
    -> src/modules/profile/containers/container-form-profile/
      -> src/modules/profile/components/form-profile/
    -> src/modules/profile/actions/update-profile-action/
    -> src/modules/profile/schemas/update-profile-input/
    -> src/modules/profile/lib/update-profile/
```

### Layer breakdown

**`src/app/[locale]/profile/page.tsx`** — Route entry:

- Imports `"server-only"`
- Reads locale from params
- Calls `setRequestLocale(locale)`
- Returns `<ScreenProfile />` directly

**`src/modules/profile/screens/screen-profile/`** — Screen:

- Module-level page UI entry
- Composes `ContainerFormProfile` and any other containers needed
- Stays server-first

**`src/modules/profile/containers/container-form-profile/`** — Container:

- Binds the profile action to the form presenter component
- Loads any data the form needs via server-side calls
- Passes prepared props to the component

**`src/modules/profile/components/form-profile/`** — Component:

- Presenter-oriented UI
- Receives form structure, initial values, and the action as props
- Does not own business logic

**`src/modules/profile/actions/update-profile-action/`** — Action:

- Uses `"use server";`
- Uses `actionClient` or `authActionClient`
- Validates input with the schema
- Calls the lib function to perform the update

**`src/modules/profile/schemas/update-profile-input/`** — Schema:

- Zod validation contract for the profile update payload
- Defines the shape and constraints of the input

**`src/modules/profile/lib/update-profile/`** — Lib:

- Reusable service logic for updating a profile
- Handles the integration with external services or database
- Not an action definition and not presenter UI

## Server-first rules

Follow these rules when using the server-first flow:

1. Do not introduce client code unless the interaction truly needs it
1. Keep the container server-side when the binding does not require hooks or
   browser APIs
1. Let the action remain server-side
1. Let the presenter component receive prepared props instead of fetching its
   own data
1. Use `import "server-only"` in `page.tsx` files
1. Keep `"use client"` at the smallest possible leaf if any client code is
   needed at all

## How actions, schemas, and lib fit together

The server-first action chain follows this pattern:

```txt
action
  -> validates input with schema
  -> calls lib function for service logic
  -> returns result or throws structured error
```

**Actions** are the server command boundary. They:

- Accept user input
- Validate it with a Zod schema
- Delegate to lib for reusable service logic
- Return a typed result

**Schemas** define the validation contract. They:

- Live in `schemas/` at the module or shared level
- Are consumed by actions for input validation
- May also be consumed by forms for client-side validation

**Lib** owns the reusable service logic. It:

- Lives in `lib/` at the module or shared level
- Is called by actions, not by components directly
- Handles integrations, database calls, and external service boundaries
- Does not define actions and does not render UI

## Checklist

Before implementing a server-first feature, verify:

- Does `page.tsx` start with `import "server-only"`?
- Does `page.tsx` return exactly one screen?
- Does the screen compose containers, not components directly?
- Can the container stay as a server component?
- Does the action validate input with a schema?
- Does reusable service logic live in `lib/`, not inline in the action?
- Are you avoiding `"use client"` unless truly required?
