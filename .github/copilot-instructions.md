# Copilot Instructions

Next.js 16 App Router template with Chakra UI v3, TypeScript strict mode, and React 19.

## Build and Test

```bash
npm run dev          # start dev server (webpack)
npm run build        # production build
npm run check-types  # tsc --noEmit
npm run lint         # eslint
npm run test         # vitest run (jsdom)
npm run format       # prettier --write .
```

## Architecture

```
src/
  app/          # Next.js App Router pages and layouts
  modules/      # Feature modules (co-locate components, hooks, actions per feature)
  shared/
    actions/    # Shared server actions
    api/        # SWR fetchers / API utilities
    components/ # Shared UI components
    config/     # env.ts (@t3-oss/env-nextjs), fonts.ts
    lib/        # dayjs, logger (pino), safe-action, fetcher, errors (error hierarchy), error-reporter
    schemas/    # Shared zod schemas (filename: <name>.schema.ts, no index.ts)
    vendor/     # Wrapped third-party components (chakra-ui/)
```

- Use `import "server-only"` at the top of every Server Component file and server-side module
- Path alias: `@/*` maps to `src/*`
- Keep feature-specific code inside `src/modules/<feature>/`

**Feature module structure** mirrors `shared/` — use it as the template:

```
src/modules/auth/
  actions/    # Server actions ("use server")
  api/        # SWR fetchers for this domain
  components/ # UI components
  hooks/      # Custom hooks
  lib/        # Domain-specific utilities
  types/      # Types/schemas (zod)
```

Not every folder is required — include only what the domain needs.

## Code Style

- TypeScript strict mode, no `any`
- Use `zod` for all runtime validation and schema definitions
- Use `ts-pattern` for exhaustive pattern matching instead of if/else chains
- Prefer named exports over default exports (except Next.js page/layout files)
- Server/client boundary: mark client files with `"use client"` only when necessary
- **File names must match the exported class or function name** — `kebab-case` derived from the export:
  - `FetchError` → `fetch-error.ts`
  - `fetchClient` → `fetch-client.ts`
  - `swrFetcher` → `swr-fetcher.ts`
  - Shared utilities grouped by role use role-based names: `helpers.ts`, `types.ts`, `constants.ts`, `index.ts`

## Key Libraries

### Environment Variables

```ts
// src/shared/config/env.ts — always import from here, never process.env directly
import { env } from "@/shared/config/env";
```

### Server Actions

```ts
"use server"; // required at top of every actions file
import { actionClient, authActionClient } from "@/shared/lib/safe-action";

const myAction = actionClient
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput }) => { ... });
```

### Logger (server-side only)

```ts
import { logger } from "@/shared/lib/logger";
logger.info({ userId }, "action completed");
```

### Date Handling

```ts
// Always import from the shared wrapper — pre-configured with Thai locale,
// Buddhist era, UTC/timezone plugins, and Asia/Bangkok default timezone
import { dayjs } from "@/shared/lib/dayjs";
```

### Data Fetching

```ts
// HTTP requests (server or client) — typed wrapper around native fetch
import { fetchClient } from "@/shared/lib/fetcher";

const data = await fetchClient<User>({ path: "/users/1" });
const created = await fetchClient<User>({
  path: "/users",
  method: "POST",
  body: { name: "Alice" },
});

// With auth token
const data = await fetchClient<User>({
  path: "/me",
  getToken: () => session.token,
});
```

```ts
// Client-side SWR hooks — use swrFetcher as the fetcher function
import useSWR from "swr";
import { swrFetcher } from "@/shared/lib/fetcher";

const { data, error, isLoading } = useSWR<User>("/users/1", swrFetcher);
```

```ts
// Feature modules define their own SWR hooks in modules/<feature>/api/
// src/modules/users/api/use-users.ts
export function useUsers() {
  return useSWR<User[]>("/users", swrFetcher);
}
```

```ts
// Error handling in data fetching
import { FetchError } from "@/shared/lib/errors";

try {
  const data = await fetchClient<User>({ path: "/users/1" });
} catch (err) {
  if (err instanceof FetchError) {
    if (err.isUnauthorized) {
      /* redirect to login */
    }
    if (err.isNotFound) {
      /* render 404 UI */
    }
  }
}
```

### Error Handling

All errors extend `AppError` from `@/shared/lib/errors`. Use the hierarchy to throw and catch typed errors.

```
AppError (abstract)
├── AuthenticationError          — 401, isOperational: true
│   └── SessionExpiredError
├── DomainError (abstract)       — isOperational: true (always)
│   ├── AuthorizationError       — 403
│   ├── BusinessRuleError        — 422
│   ├── ConflictError            — 409
│   ├── NotFoundError            — 404
│   └── ValidationError          — 422
├── HttpError (abstract)         — variable status, variable isOperational
│   └── FetchError               — thrown by fetchClient on non-ok responses
└── InfrastructureError (abstract) — 500, isOperational: false (always)
    ├── DatabaseError
    ├── ExternalServiceError
    └── UnknownError
```

```ts
import {
  NotFoundError,
  BusinessRuleError,
  FetchError,
  isAppError,
  isOperationalError,
  assertFound,
  assertRule,
  toAppError,
} from "@/shared/lib/errors";

// Throw domain errors in server actions / services
const user = await db.users.findById(id);
assertFound(user, "User"); // throws NotFoundError if null
assertRule(user.isActive, "USER_INACTIVE", "User is not active"); // throws BusinessRuleError

// isOperational = true  → safe to show message to user
// isOperational = false → log details, show generic 500 UI
if (isOperationalError(err)) {
  return { error: err.message };
}

// Normalize unknown errors to AppError
const appErr = toAppError(err);
```

### State Management

```ts
// immer / use-immer for complex mutable state
import { useImmer } from "use-immer";
// usehooks-ts for common hooks
import { useLocalStorage } from "usehooks-ts";
```

### URL Query State

```ts
// Use nuqs for type-safe URL search params (already wrapped with NuqsAdapter in layout)
import { useQueryState, parseAsInteger } from "nuqs";

const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
```

### Icons

```ts
// Use react-icons — @chakra-ui/icons is removed in v3
import { LuMail, LuSearch } from "react-icons/lu"; // Lucide (recommended)
import { FiUser } from "react-icons/fi"; // Feather
```

### Testing

```ts
// vitest + @testing-library/react + jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

---

## Chakra UI v3 Rules

### Imports

```ts
// From @chakra-ui/react (direct components + compound components like Dialog, Menu, etc.)
import {
  Alert,
  Avatar,
  Button,
  Card,
  Dialog,
  Field,
  Menu,
  Popover,
  Table,
  Input,
  NativeSelect,
  Tabs,
  Textarea,
  Separator,
  Box,
  Flex,
  Stack,
  HStack,
  VStack,
  Text,
  Heading,
  Icon,
} from "@chakra-ui/react";

// From local vendor (wrapped/extended components)
import { Provider } from "@/shared/vendor/chakra-ui/provider";
import { toaster, Toaster } from "@/shared/vendor/chakra-ui/toaster";
import { Tooltip } from "@/shared/vendor/chakra-ui/tooltip";
import {
  useColorMode,
  useColorModeValue,
  ColorModeIcon,
} from "@/shared/vendor/chakra-ui/color-mode";
```

### Color Mode

```ts
const { colorMode, toggleColorMode } = useColorMode();
const bg = useColorModeValue("white", "gray.800"); // light, dark
```

### Boolean Props

| v2 (❌)      | v3 (✅)       |
| ------------ | ------------- |
| `isOpen`     | `open`        |
| `isDisabled` | `disabled`    |
| `isInvalid`  | `invalid`     |
| `isRequired` | `required`    |
| `isLoading`  | `loading`     |
| `isChecked`  | `checked`     |
| `isActive`   | `data-active` |

### Style Props

| v2 (❌)       | v3 (✅)        |
| ------------- | -------------- |
| `colorScheme` | `colorPalette` |
| `spacing`     | `gap`          |
| `noOfLines`   | `lineClamp`    |
| `truncated`   | `truncate`     |

> **Note:** `colorScheme="light"` / `colorScheme="dark"` on `<Span className="chakra-theme ...">` is a Chakra v3 internal mechanism for forcing color mode context in a subtree — this is different from the deprecated `colorScheme` color palette prop and is intentional in `src/shared/vendor/chakra-ui/color-mode.tsx`.

### Component Renames

| v2 (❌)    | v3 (✅)       |
| ---------- | ------------- |
| `Divider`  | `Separator`   |
| `Modal`    | `Dialog`      |
| `Collapse` | `Collapsible` |

### Toast

```tsx
// ✅ v3
import { toaster } from "@/shared/vendor/chakra-ui/toaster";
toaster.create({ title: "Title", type: "error" });

// ❌ v2
const toast = useToast();
toast({ title: "Title", status: "error" });
```

### Dialog (formerly Modal)

```tsx
// ✅ v3
<Dialog.Root open={isOpen} onOpenChange={onOpenChange} placement="center">
  <Dialog.Backdrop />
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Title</Dialog.Title>
    </Dialog.Header>
    <Dialog.Body>Content</Dialog.Body>
  </Dialog.Content>
</Dialog.Root>
```

### Button Icons

```tsx
// ✅ v3 — icons are children, not props
<Button><Mail /> Email <ChevronRight /></Button>

// ❌ v2
<Button leftIcon={<Mail />} rightIcon={<ChevronRight />}>Email</Button>
```

### Field / Input Validation

```tsx
// ✅ v3
<Field.Root invalid>
  <Field.Label>Email</Field.Label>
  <Input />
  <Field.ErrorText>This field is required</Field.ErrorText>
</Field.Root>
```

### Nested Styles

```tsx
// ✅ v3
<Box css={{ "& svg": { color: "red.500" } }} />

// ❌ v2
<Box sx={{ svg: { color: "red.500" } }} />
```

### Gradients

```tsx
// ✅ v3
<Box bgGradient="to-r" gradientFrom="red.200" gradientTo="pink.500" />

// ❌ v2
<Box bgGradient="linear(to-r, red.200, pink.500)" />
```

### Theme Access

```tsx
// ✅ v3
const system = useChakra();
const value = system.token("colors.gray.400");

// ❌ v2
const theme = useTheme();
const value = theme.colors.gray["400"];
```
