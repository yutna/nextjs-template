---
applyTo: "src/modules/**/screens/**"
---

# Screens Guardrails

Rules for writing screen components in `src/modules/<module>/screens/`.

## One page returns one screen

- one `page.tsx` returns one screen directly
- one screen belongs to one `page.tsx`
- this is a strict 1-to-1 relationship

## Screens compose containers only

The required flow is: `page.tsx` → `screen` → `container` → `component`

Screens assemble containers, **not** presenter components directly.

Do **not** let screens:

- render presenter components as the primary assembly pattern
- absorb business logic belonging in containers, hooks, or actions
- become a second route layer duplicating `page.tsx`

If a screen starts orchestrating presenter props directly, a container is missing.

## Server-first by default

- remain server components unless there is a real reason otherwise
- receive route-boundary inputs from `page.tsx` (locale, params)
- do not add `"use client"` on screens by default
- move client interaction into containers beneath the screen

## Module-owned only

Use `src/modules/<module>/screens/` — never `src/shared/screens/`.

Screens are inherently module-local because each belongs to one page and
one route entry. If something is reusable across pages, it belongs in
`layouts/`, `components/`, or `hooks/`.

## Folder structure

Each screen lives in its own leaf folder prefixed with `screen-`:

```text
src/modules/profile/screens/screen-profile/
├── screen-profile.tsx
├── screen-profile.test.tsx
├── index.ts
└── types.ts
```

Rules:

- one public screen per folder
- folder and main file share the same `screen-{name}` name
- leaf-level `index.ts` for the public API
- colocate `types.ts` when the screen owns contracts
- tests adjacent to the screen
- no parent barrel files for `screens/`
- do NOT create story files for screens (stories are only for components)

## Naming

Files and folders use kebab-case with `screen-` prefix:

- `screen-welcome`, `screen-profile`, `screen-checkout`

Exported symbols follow the project-wide **UI-type-first, domain-last**
pattern with `Screen` prefix:

- `ScreenWelcome`, `ScreenProfile`, `ScreenCheckout`

## Props

- keep props small and route-shaped
- accept only what comes from `page.tsx`: `locale`, params, identifiers
- use `Readonly<>` for prop types
- do not pass large drilled objects through the screen

## Example

```tsx
// src/modules/profile/screens/screen-profile/screen-profile.tsx
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

## Checklist

- [ ] One `page.tsx` returns this one screen (1-to-1)
- [ ] Composes containers, not presenter components directly
- [ ] Server-first (no `"use client"` unless truly required)
- [ ] Lives in `src/modules/<module>/screens/` (not shared)
- [ ] Folder prefixed with `screen-`
- [ ] Exported symbol uses `Screen` prefix (`ScreenWelcome`)
- [ ] Props are small and route-shaped
- [ ] Route-boundary concerns stay in `page.tsx`
- [ ] `index.ts` re-exports types from `types.ts` when it exists
- [ ] Value exports before type exports in `index.ts`
- [ ] No story files (stories are only for components)
