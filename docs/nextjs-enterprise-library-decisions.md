# Next.js Enterprise Library Decisions

This playbook closes the gap between "the dependency exists" and "the AI knows
when to use it."

Use it alongside the core design reference in
[Next.js enterprise workflow design](./nextjs-enterprise-workflow-design.md).

## Priority order

When deciding whether to introduce a library, prefer this order:

1. native Next.js and React server-first primitives
2. existing route, feature, and action patterns already approved in the repo
3. the smallest library that solves the remaining problem clearly
4. deeper abstraction only when it earns its complexity

## Covered strongly elsewhere

- `next-intl`
- `next-safe-action`
- `server-only`
- `@chakra-ui/react`
- `@ark-ui/react`
- `@zag-js/react`
- `vitest`
- `storybook`

## Environment

### `@t3-oss/env-nextjs`

Use when:

- the app needs validated env access with explicit client-safe and server-only surfaces
- multiple modules depend on shared runtime config

Do not use ad hoc:

- in route shells
- in feature components
- in multiple independent env modules without a strong packaging reason

## Logging

### `pino`

Use when:

- server actions, route handlers, background work, or integrations need structured runtime evidence
- verification needs durable logs instead of guesswork

Guidance:

- create or extend a shared logger module
- redact sensitive data
- keep `pino-pretty` development-only

## Client-side exceptions

### `swr`

Use when:

- the browser owns a refresh loop, optimistic cache, or live-ish interaction pattern
- Server Components plus revalidation are not enough

Do not use when:

- a server render plus mutation revalidation already solves the flow

### `nuqs`

Use when:

- active browser interaction should control URL state directly
- query-string state is part of the product UX, not just a transport detail

Do not use when:

- server-side `searchParams` or form submissions already fit the design cleanly

### `immer`, `use-immer`, `usehooks-ts`

Use only inside narrow client leaves when they simplify local interaction state
without changing the overall server-first architecture.

## State machines

### `xstate`, `@xstate/react`

Use when:

- a client workflow has explicit states, events, guards, retries, or cancellation
- testable machine semantics are better than ad hoc booleans

Do not use when:

- a form post, route change, or primitive UI state is enough

Naming:

- keep machines in `*.machine.ts` or `*.machine.tsx`

## Functional and domain helpers

### `effect`

Use when:

- a server workflow benefits from typed errors, retries, resource safety, or
  layered dependency composition

Do not use when:

- a plain async function expresses the work clearly

### `ts-pattern`

Use when:

- exhaustive branching over discriminated unions or state variants adds safety

Do not use when:

- a simple `if` or `switch` is already clear and safe

### `dayjs`

Use when:

- date formatting, parsing, or timezone handling should stay consistent across
  the app

Guidance:

- prefer shared named helpers instead of inline formatting strings everywhere

## UI runtime and theming

### `motion`

Use when:

- animation has clear UX value and cannot be expressed well with CSS or Chakra
  transitions

Keep it:

- in narrow client leaves
- out of route shells

### `next-themes`

Use when:

- the app shell owns theme selection and hydration behavior

Do not use when:

- a feature wants to create its own theme boundary

### `react-icons`

Use when:

- the product needs a standard icon from an approved icon pack

Guidance:

- import from explicit subpackages such as `react-icons/hi2`
- keep accessibility labels explicit

### `clsx`

Use when:

- conditional class composition is clearer than manual string concatenation

### `@emotion/react`

Treat as Chakra infrastructure, not a parallel styling system.

## Media and assets

### `sharp`

Use when:

- the server or build pipeline needs image resizing, transformation, or
  optimization

Do not use when:

- the browser or client leaf would have to own image processing

## Tooling and verification notes

- `@testing-library/*` should verify behavior contracts, not internal structure
- `agent-browser` is an evidence layer, not an excuse to skip automated tests
- `babel-plugin-react-compiler` means the team should not cargo-cult
  `useMemo` or `useCallback`
- `@next/bundle-analyzer` is for targeted performance audits, not a default gate

## Review questions

1. Did the task reach for a client library before exhausting the server-first path?
2. Did the chosen library create a new architectural boundary that now needs its
   own convention?
3. Would another agent understand where the library is allowed and where it is
   forbidden?
4. Does the resulting code stay testable and easy to verify?
