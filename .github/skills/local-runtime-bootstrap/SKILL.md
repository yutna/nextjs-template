---
name: local-runtime-bootstrap
description: Establish the local runtime baseline for dev servers, environment setup, and browser verification. Use this before running repository flows that depend on local app execution.
---

# Local Runtime Bootstrap

Use this skill before starting the app locally or verifying rendered behavior.

Reference:

- [README.md](../../../README.md)
- [package.json](../../../package.json)
- [env config](../../../src/shared/config/env.ts)

## Use when

- a task needs `npm run dev`
- browser verification needs a running app
- build or test flows depend on local environment setup

## Usually not needed when

- the task only changes workflow files, prompts, or skills
- the task is documentation-only and does not run app flows

## Baseline

1. Use Node.js `24.13.1` or any repository-supported equivalent that satisfies `>=24.13.1`.
2. Prefer the repository `mise` setup to align the local runtime.
3. Install dependencies with `npm install`.
4. Copy `.env.example` to `.env.local` if local env is required.
5. Set required values before app execution. At minimum, `NEXT_PUBLIC_API_URL` must be valid.
6. Start only the runtime you actually need:
   - `npm run dev` for app verification
   - `npm run dev:storybook` for isolated visual iteration

## Output checklist

- runtime version confirmed
- dependencies installed
- required env presence confirmed
- app or Storybook started only when the task needs it

## Do not

- switch to yarn, pnpm, or bun for repo flows
- assume browser verification can run without a reachable dev server
- bypass the shared env validation surface in `src/shared/config/env.ts`
