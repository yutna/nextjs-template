---
name: create-component
description: >-
  Create a presenter component with types, barrel export,
  and test file
agent: agent
tools: ['edit/editFiles', 'search/codebase']
argument-hint: >-
  [module-or-shared] [component-name]
  e.g. profile form-profile
---

# Create presenter component

Create a stateless presenter component with types, barrel
export, and test file.

## Input

`${input}` contains two space-separated values:

1. **owner** — module name or `shared`
1. **component-name** — kebab-case component name

If owner is `shared`, files go under
`src/shared/components/${component}/`.
Otherwise they go under
`src/modules/${owner}/components/${component}/`.

## File creation steps

### 1 — Component file

Create `${component}.tsx` with a named export. The
component should be a stateless presenter that receives
prepared props.

```typescript
import { Box } from "@chakra-ui/react";

import type { FormProfileProps } from "./types";

export function FormProfile({
  title,
}: Readonly<FormProfileProps>) {
  return <Box>{title}</Box>;
}
```

Use Chakra UI primitives for layout and styling. Keep the
component server-first by default. Add `"use client"` only
when hooks or browser APIs are truly needed.

### 2 — Types file

Create `types.ts` with the props interface:

```typescript
export interface FormProfileProps {
  title: string;
}
```

### 3 — Barrel export

Create `index.ts`:

```typescript
export { FormProfile } from "./form-profile";

export type { FormProfileProps } from "./types";
```

### 4 — Test file

Create `${component}.test.tsx` with a basic render test:

```typescript
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { FormProfile } from "./form-profile";

vi.mock("server-only", () => ({}));

describe("FormProfile", () => {
  it("renders without crashing", () => {
    const { container } = renderWithProviders(
      <FormProfile title="Hello" />,
    );
    expect(container).toBeTruthy();
  });
});
```

### 5 — i18n messages (if needed)

When the component displays user-facing text, create
message files under `src/messages/{locale}/` following
the owning-layer path. For example a component at
`modules/profile/components/form-profile` uses namespace
`modules.profile.components.formProfile`.

Create JSON files for every locale found in
`src/messages/` (currently `en` and `th`).

## Conventions

- Folders use **kebab-case**
- Components use **PascalCase** named exports
- Every folder has `index.ts`, `types.ts`
- Use `Readonly<Props>` at the component boundary
- Use `@/` alias for cross-folder imports
- Do not use `../` parent imports
