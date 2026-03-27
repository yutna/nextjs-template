---
name: Next.js App Router Special Files
description: Keep App Router special files thin and use the correct server or client boundary for each special file type.
applyTo: "apps/web/src/app/**/loading.{ts,tsx},apps/web/src/app/**/error.{ts,tsx},apps/web/src/app/**/not-found.{ts,tsx},apps/web/src/app/**/template.{ts,tsx},apps/web/src/app/**/default.{ts,tsx},apps/web/src/app/global-error.{ts,tsx},src/app/**/loading.{ts,tsx},src/app/**/error.{ts,tsx},src/app/**/not-found.{ts,tsx},src/app/**/template.{ts,tsx},src/app/**/default.{ts,tsx},src/app/global-error.{ts,tsx}"
---
# Next.js App Router special files

Special files are route-boundary files. They do not follow the normal
feature-screen flow.

Rules:

- keep `loading.tsx`, `not-found.tsx`, `template.tsx`, and `default.tsx` thin and route-scoped
- `error.tsx` and `global-error.tsx` are intentional client-boundary exceptions
- `default.tsx` is required for approved parallel slots unless the slot is intentionally visible on every state
- use shared components for reusable visuals, but keep special-file ownership in `app/`

Do not:

- move special-file concerns into feature containers
- make broad layout or data decisions inside `loading.tsx` or `default.tsx`
- use special files to hide missing route design work
