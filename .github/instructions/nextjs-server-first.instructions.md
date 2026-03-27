---
name: Next.js Server First
description: Default to Server Components, Server Actions, and minimal client islands.
applyTo: "apps/web/src/**/*.{ts,tsx},src/**/*.{ts,tsx}"
---
# Next.js server first

Default assumptions:

- components are Server Components unless there is a concrete client-only reason
- mutations happen through Server Actions by default
- client files are leaf islands, not broad layout boundaries

Rules:

- keep `"use client"` as narrow as possible
- place client components under `components/client/` or use a `.client.tsx` suffix
- keep client component file names role-specific and kebab-case so the path still communicates responsibility
- pass serialized props from server shells into client islands
- keep data fetching and authorization on the server by default
- mark server-exclusive data modules with `server-only` when the dependency is available in the project baseline
- if URL state is client-owned, justify it and keep it behind an approved client boundary
- treat `swr`, `nuqs`, `xstate`, `motion`, `next-themes`, `usehooks-ts`, and `use-immer` as client-side exceptions that need an explicit reason
- for complex UI primitives, prefer Chakra UI or Ark UI first and introduce Zag.js only when the interaction model needs to be explicit

Do not:

- add `"use client"` to route roots or large feature trees without a recorded reason
- fetch server-owned data from the browser by habit
- move business logic into client hooks just to make composition easier
