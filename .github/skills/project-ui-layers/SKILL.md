---
name: project-ui-layers
description: >
  Project conventions for page.tsx entry files, screen components, container components,
  and presenter components. Use when creating, modifying, or reviewing any of these layers.
  Covers the page→screen→container→component architecture flow, 1:1 page-screen relationship,
  container as required bridge layer, and presenter component patterns.
---

# Project UI Layers

This skill covers the 4-layer UI architecture used in this repository.

## Architecture flow

Every feature follows this layered composition:

```text
page.tsx → screen → container → component
```

- **page.tsx** — thin, server-only route entry;
  returns exactly one screen
- **screen** — module-level page UI;
  assembles containers (never presenters directly)
- **container** — required bridge layer;
  binds logic (hooks, actions, data) to presenters
- **component** — presenter-oriented UI;
  receives prepared props; stays logic-light

## Layer rules

### page.tsx

- Always starts with `import "server-only";`
- One page returns one screen directly (1:1 relationship)
- Named `Page` as the default export
- Handles only route-entry concerns: params, locale setup, redirect
- Never assembles containers or renders presenter components directly

Reference: [page-patterns.md](references/page-patterns.md)

### Screens

- Live in `src/modules/<module-name>/screens/`
- Never in `src/shared/screens/` — screens are always module-owned
- Folder and file prefixed with `screen-` (e.g., `screen-welcome/screen-welcome.tsx`)
- Exported symbol uses `Screen` prefix in PascalCase (e.g., `ScreenWelcome`)
- Server-first by default — no `"use client"` unless truly required
- Compose containers only, not presenter components directly
- Props are small and route-shaped (locale, params-derived values)

Reference: [screen-patterns.md](references/screen-patterns.md)

### Containers

- Live in `src/modules/<module-name>/containers/`
- Never in `src/shared/containers/` — containers are always module-owned
- Folder and file prefixed with `container-` (e.g., `container-checkout-form/`)
- Exported symbol uses `Container` prefix in PascalCase (e.g., `ContainerFormCheckout`)
- Required bridge layer beneath screens —
  if a screen needs to render UI, a container must exist
- May be server or client depending on binding needs
- Binds hooks, actions, and data to presenters —
  does not own business logic
- Server-first default: only add `"use client"` when hooks or browser APIs are needed

Reference: [container-patterns.md](references/container-patterns.md)

### Components

- Live in `src/modules/<module-name>/components/` or `src/shared/components/`
- Module-first scope; promote to shared only when truly cross-module
- One public component per leaf folder
- Folder and main file share the same kebab-case name
- Presenter-oriented: receive prepared props, stay logic-light
- Can be server or client, but remain presenter-focused either way
- Extract heavy logic into hooks or containers

Reference: [component-patterns.md](references/component-patterns.md)

## Relationship diagram

```text
app/**/page.tsx
  → modules/<module>/screens/screen-*/
    → modules/<module>/containers/container-*/
      → modules/<module>/components/*
      → shared/components/*
```

Supporting layers fit beside this flow:

```text
container → hooks/    (extracted client logic)
container → actions/  (server mutations)
container → lib/      (service boundaries)
container → schemas/  (validation contracts)
```

## Server-first mindset

The default for every layer is server-side. Only add `"use client"` when:

- The component needs hooks, browser APIs, or client-only interactivity
- Keep `"use client"` at the smallest possible leaf
- Prefer server data loading over client fetching
- Prefer server actions over client mutation plumbing

## Common file structure

Each layer follows the same leaf-folder convention:

```text
src/modules/<module>/screens/screen-example/
├── screen-example.tsx
├── screen-example.test.tsx
├── index.ts
└── types.ts
```

Rules for all layers:

- kebab-case folder and file names
- Leaf-level `index.ts` for the public API
- Colocate `types.ts` when the unit owns reusable contracts
- Keep tests adjacent to the file they cover
- No parent barrel files for `screens/`, `containers/`, or `components/`

## Common mistakes

| Mistake | Fix |
| --- | --- |
| page assembles containers | Return one screen instead |
| Screen renders presenters | Compose containers |
| Container owns logic | Extract to hooks/actions/lib |
| Component is a controller | Move logic to container |
| `"use client"` too high | Push to smallest leaf |
| Screens in `shared/` | Always module-owned |
| Containers in `shared/` | Always module-owned |
| Shared components too early | Keep module-owned first |

## Quick reference

| Concern | Layer | Location |
| --- | --- | --- |
| Route entry | page | `src/app/**/page.tsx` |
| Page UI | screen | `modules/<mod>/screens/` |
| Logic binding | container | `modules/<mod>/containers/` |
| Presenter UI | component | `modules/` or `shared/` |
| Client logic | hook | `modules/` or `shared/` |
| Server mutation | action | `modules/` or `shared/` |
| Validation | schema | `modules/` or `shared/` |
| Service logic | lib | `modules/` or `shared/` |
| Structural frame | layout | `modules/` or `shared/` |

## End-to-end example

### page.tsx (route entry)

```tsx
import "server-only";

import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import { ScreenProfile } from "@/modules/profile/screens/screen-profile";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function Page({ params }: Readonly<PageProps>) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <ScreenProfile locale={locale} />;
}
```

### Screen (assembles containers)

```tsx
import "server-only";

import { Box } from "@chakra-ui/react";

import { ContainerFormProfile } from "@/modules/profile/containers/container-form-profile";
import { ContainerHeaderProfile } from "@/modules/profile/containers/container-header-profile";

import type { ScreenProfileProps } from "./types";

export async function ScreenProfile({ locale }: Readonly<ScreenProfileProps>) {
  return (
    <Box as="main">
      <ContainerHeaderProfile locale={locale} />
      <ContainerFormProfile />
    </Box>
  );
}
```

### Container (binds logic to presenter)

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

### Component (presenter)

```tsx
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
