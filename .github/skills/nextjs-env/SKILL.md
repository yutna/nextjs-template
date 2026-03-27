---
name: nextjs-env
description: Design and review environment access around a single @t3-oss/env-nextjs boundary. Use this when a Next.js task touches env values, runtime config, or secret handling.
---

# Next.js Env

Use this skill when a task introduces, changes, or audits environment access.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [Next.js env instruction](../../instructions/nextjs-env.instructions.md)
- [Next.js enterprise library decisions](../../../docs/nextjs-enterprise-library-decisions.md)

## Goals

- one validated env boundary
- explicit server and client-safe surfaces
- no raw `process.env` drift through feature code

## Process

1. Identify which env values are truly required for the affected feature or runtime path.
2. Place validation in the shared env module with `@t3-oss/env-nextjs`.
3. Split secret server values from browser-safe public values deliberately.
4. Pass validated values into lower layers through stable modules, not ad hoc parsing.
5. Keep tests and scripts aligned with the same env contract.

## Review checklist

- is env validation centralized?
- are secrets prevented from leaking into client code?
- are defaults and optional values explicit?
- do runtime config changes stay understandable to future agents?

## Do not

- call `createEnv` in multiple feature files
- read `process.env` straight from route shells or client leaves
- hide missing env handling inside runtime crashes
