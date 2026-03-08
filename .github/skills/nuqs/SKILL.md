---
name: nuqs
description: >
  Type-safe URL search params state management. Mandatory for
  all URL-driven state in this project. Covers useQueryState,
  useQueryStates, createLoader for server-side parsing, typed
  parsers, and the NuqsAdapter setup for Next.js App Router.
metadata:
  version: "2.8"
  source: https://nuqs.47ng.com
---

# nuqs for this project

nuqs is the **mandatory** library for reading and writing URL
search params. It replaces manual `URLSearchParams` parsing
with type-safe, reactive hooks on the client and typed loaders
on the server.

## Rules

- **Always use nuqs** for URL-driven state — never parse
  `searchParams` manually in client code
- **Always use typed parsers** — `parseAsString`, `parseAsInteger`,
  `parseAsBoolean`, `parseAsStringLiteral`, etc.
- **Always use `.withDefault()`** — avoid nullable state unless
  truly optional
- **Prefer `useQueryStates`** when reading 2+ params at once —
  batches URL updates into one navigation
- **Use `createLoader`** for server-side parsing in `page.tsx` —
  keeps the server-first approach intact
- **Wrap with `NuqsAdapter`** from `nuqs/adapters/next/app` in
  the root layout (already set up)

## Layer boundaries

| Layer | nuqs usage |
| --- | --- |
| `page.tsx` | `createLoader` for server-side parsing |
| `screens/` | Pass parsed values down to containers |
| `containers/` | `useQueryState` / `useQueryStates` for client state |
| `hooks/` | `useQueryState` / `useQueryStates` for reusable URL logic |
| `components/` | Receive values as props — never call nuqs directly |
| `actions/` | Never — actions do not read URL state |
| `lib/` | `createLoader` / `createSerializer` for server utilities |

## Defining search params

Define search params descriptors in a dedicated file and share
them between client hooks and server loaders:

```ts
// src/modules/orders/schemas/order-search-params.ts
import {
  createLoader,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

const ORDER_STATUSES = ["pending", "shipped", "delivered"] as const;

export const orderSearchParams = {
  q: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  status: parseAsStringLiteral(ORDER_STATUSES),
};

export const loadOrderSearchParams = createLoader(orderSearchParams);
```

## Server-side parsing in page.tsx

Use `createLoader` to parse search params on the server:

```tsx
// src/app/[locale]/(private)/orders/page.tsx
import "server-only";

import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import { ScreenOrders } from "@/modules/orders/screens/screen-orders";
import { loadOrderSearchParams } from "@/modules/orders/schemas/order-search-params";

import type { SearchParams } from "nuqs/server";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}

export default function Page({ params, searchParams }: Readonly<PageProps>) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const filters = loadOrderSearchParams(searchParams);

  return <ScreenOrders filters={filters} />;
}
```

## Client-side hooks

Use `useQueryState` for a single param or `useQueryStates` for
multiple params:

```tsx
// src/modules/orders/hooks/use-order-filters/use-order-filters.ts
"use client";

import { useQueryStates } from "nuqs";

import { orderSearchParams } from "@/modules/orders/schemas/order-search-params";

export function useOrderFilters() {
  const [filters, setFilters] = useQueryStates(orderSearchParams);

  return { filters, setFilters };
}
```

Single param:

```tsx
"use client";

import { parseAsString, useQueryState } from "nuqs";

export function useSearchQuery() {
  const [query, setQuery] = useQueryState(
    "q",
    parseAsString.withDefault("")
  );

  return { query, setQuery };
}
```

## Options

Common options to pass to parsers or hooks:

```ts
parseAsString.withOptions({
  // Push to history instead of replace (default: false)
  history: "push",
  // Sync with server on change (default: true for App Router)
  shallow: false,
  // Remove param when value equals default (default: true)
  clearOnDefault: true,
  // Debounce URL updates in ms (default: 0)
  throttleMs: 500,
});
```

## Testing

Use `NuqsTestingAdapter` to test components that consume nuqs:

```tsx
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { render, screen } from "@testing-library/react";

render(
  <NuqsTestingAdapter searchParams={{ q: "test", page: "2" }}>
    <OrderFilters />
  </NuqsTestingAdapter>
);
```

## Serialization

Use `createSerializer` to build URL strings from search param
descriptors (useful in server-side redirects or link builders):

```ts
import { createSerializer } from "nuqs/server";

import { orderSearchParams } from "@/modules/orders/schemas/order-search-params";

const serialize = createSerializer(orderSearchParams);

serialize("/orders", { q: "shoes", page: 2 });
// -> "/orders?q=shoes&page=2"
```

## Reference

See `references/llms-full.md` for the complete nuqs
documentation including all parsers, adapters, options,
and advanced patterns.
