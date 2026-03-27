---
name: Next.js Env
description: Centralize validated environment access with @t3-oss/env-nextjs and keep env decisions out of route shells and client code.
applyTo: "apps/web/src/**/*.{ts,tsx},src/**/*.{ts,tsx},**/env/**/*.{ts,tsx},**/env.{ts,tsx},next.config.*"
---
# Next.js env

Treat environment access as an architecture boundary.

Rules:

- use `@t3-oss/env-nextjs` in a single validated env module for the app or package boundary
- split server-only and client-safe env surfaces explicitly
- import env values from the validated module, not from `process.env` directly
- fail fast during bootstrap when required env values are missing or malformed
- keep feature code unaware of raw env parsing details
- if tests need env overrides, provide them through a controlled test helper or module boundary

Do not:

- call `createEnv` from route shells, feature components, or ad hoc utility files
- expose server secrets through client-safe env surfaces
- duplicate env schemas in multiple features
