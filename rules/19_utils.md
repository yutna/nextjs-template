# Utils Folder Style Guide

This guide defines how to write and organize code inside:

- `src/shared/utils`
- `src/modules/<module-name>/utils`

Use these folders for small, framework-light utilities that are easy to reuse and test. Keep the guide aligned with the repository's existing TypeScript, naming, and testing conventions.

## 1. Decide whether code belongs in `utils`

Put code in a `utils` folder when it is:

- a small reusable function or a tiny group of related functions
- mostly framework-agnostic
- easy to describe by input/output behavior
- safe to reuse across multiple files in the same scope

Examples:

- string formatting
- array/object transforms
- date/value normalization
- query param serialization or parsing
- small type guards

Do **not** put code in `utils` when it belongs somewhere more specific:

- `lib/` for infrastructure, integrations, shared service wrappers, or code with stronger architectural meaning
- `schemas/` for Zod schemas and validation contracts
- `actions/` for server actions
- `hooks/` for React hook logic
- component or screen folders for logic used by only one UI feature
- `constants/` or `config/` for static values and configuration

Rule of thumb:

- If the code mainly translates data, checks values, or formats output, `utils` is usually correct.
- If the code owns app behavior, talks to external systems, or encodes domain workflows, it likely belongs elsewhere.

## 2. Scope and placement

Choose the narrowest valid scope first.

### `src/modules/<module-name>/utils`

Prefer module-level utils when the utility is only relevant to one feature module.

Examples:

- `src/modules/static-pages/utils/format-stat.ts`
- `src/modules/orders/utils/build-order-label.ts`

### `src/shared/utils`

Promote a utility to shared only when it is truly cross-module and generic enough to be reused without leaking feature-specific language.

Examples:

- `src/shared/utils/format-number.ts`
- `src/shared/utils/is-non-empty-string.ts`

Avoid moving code to `shared` too early. Start local to the module unless reuse is already proven or clearly intended.

## 3. File and folder structure

Follow the project's kebab-case convention for files and folders.

### One utility per folder

Each utility should live in its own folder, even when it exports only one public function.

```txt
src/shared/utils/format-phone-number/
├── format-phone-number.ts
├── format-phone-number.test.ts
└── index.ts

src/modules/profile/utils/normalize-display-name/
├── normalize-display-name.ts
├── normalize-display-name.test.ts
└── index.ts
```

Rules:

- keep one public utility per folder
- name the folder and main implementation file the same
- add a leaf-level `index.ts` for that utility folder
- use `types.ts` only when shared types improve clarity
- keep tests adjacent to the utility they cover
- do not create parent barrel files for `shared/utils` or `modules/<module>/utils`
- do not group multiple public utilities into one folder

## 4. Naming

Name utilities after what they do, not where they are used.

Prefer:

- `format-currency.ts`
- `build-pagination-label.ts`
- `is-browser-error.ts`
- `clamp-number.ts`
- `parse-locale-cookie.ts`

Avoid:

- `helpers.ts`
- `common.ts`
- `utils.ts`
- `misc.ts`
- `shared.ts`

For exported symbols:

- use descriptive verb names for transformers and actions: `formatCurrency`, `normalizePhoneNumber`, `buildSearchParams`
- use `is*`, `has*`, or `can*` for booleans and type guards
- use `assert*` for functions that throw on invalid state
- use noun names only for true values or constants

## 5. Function design

Utilities should be small, predictable, and explicit.

- Prefer pure functions with no hidden side effects.
- Make dependencies obvious through parameters instead of reading mutable external state.
- Return values instead of mutating inputs unless mutation is the explicit purpose.
- Keep one clear responsibility per function.
- Split long conditionals or mixed responsibilities into smaller helpers.

Good:

```ts
export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
```

Avoid packing unrelated behavior into one utility:

```ts
// Avoid: formatting, validation, fallback behavior, and logging in one place
export function handlePrice(value: unknown): string {
  // ...
}
```

## 6. TypeScript rules

Match the repository's strict TypeScript style.

- Type all parameters and return values when they are not trivially inferred.
- Prefer `unknown` over `any` for untrusted input.
- Use narrow unions, type guards, and assertions instead of unsafe casts.
- Extract shared types to `types.ts` only when multiple files need them.
- Use `Readonly<T>` for object-shaped public inputs when immutability improves safety and matches usage.

Examples from the codebase to emulate:

- focused typed exports like `delay(ms: number): Promise<void>`
- guard-style helpers like `isNetworkError(err: unknown): boolean`
- assertion helpers like `assertFound<T>(...): asserts value is T`

## 7. Error handling

Utilities should fail clearly and consistently.

- Throw only when invalid input or impossible state is part of the contract.
- Prefer explicit validation over silent fallback behavior.
- If a utility needs domain-aware or infrastructure-aware errors, it may belong in `lib/` instead of `utils`.
- Reuse the existing `AppError` hierarchy when the helper participates in application error handling.

Good fits for `utils`:

- parsing, normalization, comparison, formatting, guards

Usually not a fit for `utils`:

- database wrappers
- HTTP clients
- auth/session flows
- app-wide error reporting

## 8. Comments and documentation

Keep comments minimal.

- Add JSDoc only when the contract, edge cases, or thrown behavior need explanation.
- Prefer expressive naming over explanatory comments.
- Include examples in docs only when the function's behavior is not obvious.

This mirrors existing patterns such as:

- concise no-comment helpers for obvious behavior
- short JSDoc on assertion helpers where failure semantics matter

## 9. Imports and exports

- Use the `@/*` path alias for cross-folder imports.
- Use relative imports within the same utility folder.
- Keep public exports small and intentional.
- Export types separately when helpful: `export type { QueryStringOptions } from "./types";`
- Keep `index.ts` limited to the public API of that single utility folder.
- Do not create catch-all exports for unrelated utilities.

Good:

```ts
// src/shared/utils/format-phone-number/index.ts
export { formatPhoneNumber } from "./format-phone-number";
```

Avoid:

```ts
// Avoid re-exporting multiple utility folders from one place
export * from "../format-currency";
export * from "../format-phone-number";
export * from "../is-non-empty-string";
```

## 10. Testing

Every non-trivial utility should have adjacent tests.

- Use Vitest.
- Name test files after the utility:
  - `format-phone-number.test.ts`
  - `build-order-reference.test.ts`
- Cover both happy paths and edge cases.
- Test contract behavior, not implementation details.
- For guards and assertions, include invalid inputs and failure cases.

Typical utility tests should cover:

- valid inputs
- edge cases
- invalid or unknown inputs
- thrown errors when applicable
- stable output shape

## 11. Example patterns

### Good shared utility

```txt
src/shared/utils/is-non-empty-string.ts
src/shared/utils/is-non-empty-string.test.ts
```

```ts
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
```

### Good module utility

```txt
src/modules/orders/utils/build-order-reference.ts
src/modules/orders/utils/build-order-reference.test.ts
```

```ts
export function buildOrderReference(prefix: string, id: number): string {
  return `${prefix}-${id.toString().padStart(6, "0")}`;
}
```

### Move out of `utils`

If a helper starts doing any of the following, move it to a more specific folder:

- depends on React, browser-only APIs, or hooks
- wraps fetch/database/auth/external services
- encodes domain rules that deserve a named service or `lib` module
- grows into a multi-step workflow instead of a focused helper

## 12. Review checklist

Before adding a new utility, check:

- Is `utils` the right folder, or would `lib`, `schemas`, `hooks`, `actions`, or a local feature file be clearer?
- Is the scope correct: module first, shared only when truly reusable?
- Is the file or folder name specific and kebab-case?
- Is the exported API focused and easy to understand?
- Are types explicit and safe?
- Are edge cases and failure cases tested?
- Is there any unnecessary abstraction, comment, or barrel export?
