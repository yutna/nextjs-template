<!-- markdownlint-disable -->
nuqs - Type-safe search params state management for React. Like useState, but stored in the URL query string.

--

# Installation

URL (HTML): /docs/installation
URL (LLMs): /docs/installation.md
Source: https://raw.githubusercontent.com/47ng/nuqs/refs/heads/master/packages/docs/content/docs/installation.mdx

Getting started

import {
  NextJS,
  ReactRouter,
  ReactRouterV7,
  ReactSPA,
  Remix,
  TanStackRouter,
} from '@/src/components/frameworks'

Install the `nuqs` package with your favourite package manager:

* NPM: `npm install nuqs`
* PNPM: `pnpm add nuqs`
* Yarn: `yarn add nuqs`
* Bun: `bun add nuqs`

## Which version should I use?

`nuqs@^2` supports the following frameworks and their respective versions:

* <NextJS className="inline mr-1.5" role="presentation" /> [Next.js](/docs/adapters#nextjs): `next@>=14.2.0` <small className="text-muted-foreground">(app & pages routers)</small>
* <ReactSPA className="inline mr-1.5" role="presentation" /> [React SPA](/docs/adapters#react-spa): `react@^18.3 || ^19`
* <Remix className="inline mr-1.5" role="presentation" /> [Remix](/docs/adapters#remix): `@remix-run/react@^2`
* <ReactRouter className="inline mr-1.5" role="presentation" /> [React Router v6](/docs/adapters#react-router-v6): `react-router-dom@^6`
* <ReactRouterV7 className="inline mr-1.5" role="presentation" /> [React Router v7](/docs/adapters#react-router-v7): `react-router@^7`
* <TanStackRouter className="inline mr-1.5 not-prose" role="presentation" /> [TanStack Router](/docs/adapters#tanstack-router): `@tanstack/react-router@^1`

<Callout>
  For older versions of Next.js, you may use `nuqs@^1` (documentation in `node_modules/nuqs/README.md`).
</Callout>

---

# Adapters

URL (HTML): /docs/adapters
URL (LLMs): /docs/adapters.md
Source: https://raw.githubusercontent.com/47ng/nuqs/refs/heads/master/packages/docs/content/docs/adapters.mdx

Using nuqs in your React framework of choice

import {
  NextJS,
  ReactRouter,
  ReactRouterV7,
  ReactSPA,
  Remix,
  TanStackRouter,
  Vitest,
} from '@/src/components/frameworks'

Since version 2, you can now use nuqs in the following React frameworks, by
wrapping it with a `NuqsAdapter{:ts}` context provider:

* <NextJS className="inline mr-1.5" role="presentation" /> [Next.js (app router)](#nextjs-app-router)
* <NextJS className="inline mr-1.5" role="presentation" /> [Next.js (pages router)](#nextjs-pages-router)
* <ReactSPA className="inline mr-1.5" role="presentation" /> [React SPA (eg: with Vite)](#react-spa)
* <Remix className="inline mr-1.5" role="presentation" /> [Remix](#remix)
* <ReactRouter className="inline mr-1.5" role="presentation" /> [React Router v6](#react-router-v6)
* <ReactRouterV7 className="inline mr-1.5" role="presentation" /> [React Router v7](#react-router-v7)
* <TanStackRouter className="inline mr-1.5 not-prose" role="presentation" /> [TanStack Router](#tanstack-router)

## <NextJS className="inline mr-1.5 -mt-1" role="presentation" /> Next.js

### App router

Wrap your `{children}{:ts}` with the `NuqsAdapter{:ts}` component in your root layout file:

```tsx title="src/app/layout.tsx"
// [!code word:NuqsAdapter]
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { type ReactNode } from 'react'

export default function RootLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <html>
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  )
}
```

### Pages router

Wrap the `<Component>{:ts}` page outlet with the `NuqsAdapter{:ts}` component in your `_app.tsx` file:

```tsx title="src/pages/_app.tsx"
// [!code word:NuqsAdapter]
import type { AppProps } from 'next/app'
import { NuqsAdapter } from 'nuqs/adapters/next/pages'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NuqsAdapter>
      <Component {...pageProps} />
    </NuqsAdapter>
  )
}
```

### Unified (router-agnostic)

If your Next.js app uses **both the app and pages routers** and the adapter needs
to be mounted in either, you can import the unified adapter, at the cost
of a slightly larger bundle size (\~100B).

```tsx
import { NuqsAdapter } from 'nuqs/adapters/next'
```

<br />

The main reason for adapters is to open up nuqs to other React frameworks:

## <ReactSPA className="inline mr-1.5 -mt-1" role="presentation" /> React SPA

Example, with Vite:

```tsx title="src/main.tsx"
// [!code word:NuqsAdapter]
import { NuqsAdapter } from 'nuqs/adapters/react'

createRoot(document.getElementById('root')!).render(
  <NuqsAdapter>
    <App />
  </NuqsAdapter>
)
```

<Callout title="Note">
  Because there is no known server in this configuration, the
  [`shallow: false{:ts}`](/docs/options#shallow) option will have no effect.

  See below for some options:
</Callout>

### Full page navigation on <br className="hidden [#nd-toc_&]:block" />`shallow: false{:ts}`

<FeatureSupportMatrix
  introducedInVersion="2.4.0"
  support={{
supported: true,
frameworks: ['React SPA']
}}
/>

You can specify a flag to perform a full-page navigation when
updating query state configured with `shallow: false{:ts}`, to notify the web server
that the URL state has changed, if it needs it for server-side rendering other
parts of the application than the static React bundle:

```tsx title="src/main.tsx"
// [!code word:fullPageNavigationOnShallowFalseUpdates]
createRoot(document.getElementById('root')!).render(
  <NuqsAdapter fullPageNavigationOnShallowFalseUpdates>
    <App />
  </NuqsAdapter>
)
```

This may be useful for servers not written in JavaScript, like Django (Python),
Rails (Ruby), Laravel (PHP), Phoenix (Elixir) etc…

## <Remix className="inline mr-1.5 -mt-1" role="presentation" /> Remix

```tsx title="app/root.tsx"
// [!code word:NuqsAdapter]
import { NuqsAdapter } from 'nuqs/adapters/remix'

// ...

export default function App() {
  return (
    <NuqsAdapter>
      <Outlet />
    </NuqsAdapter>
  )
}
```

## <ReactRouter className="inline mr-1.5 -mt-1" role="presentation" /> React Router v6

```tsx title="src/main.tsx"
// [!code word:NuqsAdapter]
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  }
])

export function ReactRouter() {
  return (
    <NuqsAdapter>
      <RouterProvider router={router} />
    </NuqsAdapter>
  )
}
```

<Callout>
  Only `BrowserRouter` is supported. There may be support for `HashRouter`
  in the future (see issue [#810](https://github.com/47ng/nuqs/issues/810)), but
  support for `MemoryRouter` is not planned.
</Callout>

## <ReactRouterV7 className="inline mr-1.5 -mt-1" role="presentation" /> React Router v7

```tsx title="app/root.tsx"
// [!code word:NuqsAdapter]
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7'
import { Outlet } from 'react-router'

// ...

export default function App() {
  return (
    <NuqsAdapter>
      <Outlet />
    </NuqsAdapter>
  )
}
```

<Callout type="warn" title="Deprecation notice">
  The generic import `nuqs/adapters/react-router` (pointing to v6)
  is deprecated and will be removed in nuqs\@3.0.0.

  Please pin your imports to the specific version,
  eg: `nuqs/adapters/react-router/v6` or `nuqs/adapters/react-router/v7`.

  The main difference is where the React Router hooks are imported from:
  `react-router-dom` for v6, and `react-router` for v7.
</Callout>

## <TanStackRouter className="inline mr-1.5 -mt-1 not-prose" role="presentation" /> TanStack Router

```tsx title="src/routes/__root.tsx"
// [!code word:NuqsAdapter]
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <>
      <NuqsAdapter>
        <Outlet />
      </NuqsAdapter>
    </>
  ),
})
```

<Callout>
  TanStack Router support is experimental and does not yet cover TanStack Start.
</Callout>

### Type-safe routing via `validateSearch`

TanStack Router comes with built-in type-safe search params support,
and its APIs should likely be used in your application code for best DX.

Nevertheless, sometimes you may need to import a component that uses nuqs
(from NPM or a shared library), and benefit from TanStack Router’s type-safe routing.

You may do so via the [Standard Schema](/docs/utilities#standard-schema) support:

```tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  createStandardSchemaV1,
  parseAsIndex,
  parseAsString,
  useQueryStates
} from 'nuqs'

const searchParams = {
  searchQuery: parseAsString.withDefault(''),
  pageIndex: parseAsIndex.withDefault(0),
}

export const Route = createFileRoute('/search')({
  component: RouteComponent,
  // [!code highlight:3]
  validateSearch: createStandardSchemaV1(searchParams, {
    partialOutput: true
  })
})

function RouteComponent() {
  // Consume nuqs state as usual:
  const [{ searchQuery, pageIndex }] = useQueryStates(searchParams)
  // But now TanStack Router knows about it too:
  return (
    <Link
      to="/search"
      search={{
        searchQuery: 'foo',
        // note: we're not specifying pageIndex
      }}
    />
  )
}
```

Note that the `partialOutput{:ts}` flag allows specifying only a subset of
the search params for a given route. It also does not reflect those search
in the URL automatically, following nuqs’ behaviour more closely.

<Callout title="Caveats" type="warn">
  Due to differences in how TanStack Router and nuqs handle serialisation and deserialisation
  (global in TanStack Router and per-key in nuqs), only *trivial* state types are supported for
  type-safe linking. Those include all string-based parsers (string, enum, literals),
  number-based (integer, float, number literal), boolean, and JSON.

  The `urlKeys` feature to provide shorthand key names is also not supported for similar
  reasons.
</Callout>

## <Vitest className="inline mr-1.5 -mt-1" role="presentation" /> Testing

<Callout>
  Documentation for the `NuqsTestingAdapter{:ts}` is on the [testing page](/docs/testing).
</Callout>

---

# Basic usage

URL (HTML): /docs/basic-usage
URL (LLMs): /docs/basic-usage.md
Source: https://raw.githubusercontent.com/47ng/nuqs/refs/heads/master/packages/docs/content/docs/basic-usage.mdx

Replacing React.useState with useQueryState

import {
  DemoFallback,
  BasicUsageDemo
} from '@/content/docs/parsers/demos'

<Callout title="Prerequisite">
  Have you setup your app with the appropriate [**adapter**](/docs/adapters)? Then you
  are all set!
</Callout>

If you are using `React.useState` to manage your local UI state,
you can replace it with `useQueryState` to sync it with the URL.

```tsx
'use client'

import { useQueryState } from 'nuqs'

export function Demo() {
  const [name, setName] = useQueryState('name')
  return (
    <>
      <input value={name || ''} onChange={e => setName(e.target.value)} />
      <button onClick={() => setName(null)}>Clear</button>
      <p>Hello, {name || 'anonymous visitor'}!</p>
    </>
  )
}
```

<Suspense fallback={<DemoFallback/>}>
  <BasicUsageDemo />
</Suspense>

`useQueryState` takes one required argument: the key to use in the query string.

Like `React.useState`, it returns an array with the value present in the query
string as a string (or `null{:ts}` if none was found), and a state updater function.

Example outputs for our demo example:

| URL          | name value   | Notes                                                            |
| ------------ | ------------ | ---------------------------------------------------------------- |
| `/`          | `null{:ts}`  | No `name` key in URL                                             |
| `/?name=`    | `''{:ts}`    | Empty string                                                     |
| `/?name=foo` | `'foo'{:ts}` |                                                                  |
| `/?name=2`   | `'2'{:ts}`   | Always returns a string by default, see [Parsers](/docs/parsers) |

<Callout title="Tip">
  Setting `null{:ts}` as a value will remove the key from the query string.
</Callout>

## Default values

When the query string is not present in the URL, the default behaviour is to
return `null{:ts}` as state.

It can make state updating and UI rendering tedious.
Take this example of a simple counter stored in the URL:

```tsx
import { useQueryState, parseAsInteger } from 'nuqs'

export default () => {
  const [count, setCount] = useQueryState('count', parseAsInteger)
  return (
    <>
      <pre>count: {count}</pre>
      <button onClick={() => setCount(0)}>Reset</button>
      {/* handling null values in setCount is annoying: */}
      <button onClick={() => setCount(c => (c ?? 0) + 1)}>+</button>
      <button onClick={() => setCount(c => (c ?? 0) - 1)}>-</button>
      <button onClick={() => setCount(null)}>Clear</button>
    </>
  )
}
```

You can provide a default value as the second argument to `useQueryState` (or
via the `.withDefault{:ts}` builder method on parsers):

```ts
const [search] = useQueryState('search', { defaultValue: '' })
//      ^? string

const [count] = useQueryState('count', parseAsInteger)
//      ^? number | null -> no default value = nullable

const [count] = useQueryState('count', parseAsInteger.withDefault(0))
//      ^? number
```

It makes it much easier to handle state updates:

```tsx
const increment = () => setCount(c => c + 1) // c will never be null
const decrement = () => setCount(c => c - 1) // c will never be null
const clearCount = () => setCount(null) // Remove query from the URL
```

<Callout title="Note">
  The default value is internal to React, it will **not** be written to the
  URL *unless you set it explicitly* and use the [`clearOnDefault: false{:ts}` option](/docs/options#clear-on-default).
</Callout>

<Callout title="Tip">
  The default value is also returned if the value is *invalid* for the parser.
</Callout>

<Callout title="Tip">
  Setting the state to `null{:ts}` when a default value is specified:

  1. Clears the query from the URL
  2. Returns the default value as state
</Callout>

---

# Built-in parsers

URL (HTML): /docs/parsers/built-in
URL (LLMs): /docs/parsers/built-in.md
Source: https://raw.githubusercontent.com/47ng/nuqs/refs/heads/master/packages/docs/content/docs/parsers/built-in.mdx

When using strings is not enough

import {
  DemoFallback,
  IntegerParserDemo,
  StringParserDemo,
  FloatParserDemo,
  HexParserDemo,
  IndexParserDemo,
  BooleanParserDemo,
  StringLiteralParserDemo,
  DateISOParserDemo,
  DatetimeISOParserDemo,
  DateTimestampParserDemo,
  JsonParserDemo,
  NativeArrayParserDemo
} from '@/content/docs/parsers/demos'

Search params are strings by default, but chances are your state is more complex than that.

You might want to use numbers, booleans, Dates, objects, arrays, or even custom types.
This is where **parsers** come in.

`nuqs` provides built-in parsers for the most common types, and allows you to [define your own](/docs/parsers/making-your-own).

## String

```ts
import { parseAsString } from 'nuqs'
```

<Suspense fallback={<DemoFallback />}>
  <StringParserDemo />
</Suspense>

<Callout title="Type-safety tip">
  `parseAsString` is a noop: it does not perform any validation when parsing,
  and will accept **any** value.

  If you’re expecting a certain set of string values, like `'foo' | 'bar'{:ts}`,
  see [Literals](#literals) for ensuring type-runtime safety.
</Callout>

If search params are strings by default, what’s the point of this *“parser”* ?

It becomes useful if you’re declaring a search params object, and/or you want
to use the builder pattern to specify [default values](/docs/basic-usage#default-values)
and [options](/docs/options):

```ts
export const searchParamsParsers = {
  q: parseAsString.withDefault('').withOptions({
    shallow: false
  })
}
```

## Numbers

### Integers

Transforms the search param string into an integer with `parseInt` (base 10).

```ts
import { parseAsInteger } from 'nuqs'

useQueryState('int', parseAsInteger.withDefault(0))
```

<Suspense fallback={<DemoFallback />}>
  <IntegerParserDemo />
</Suspense>

### Floating point

Same as integer, but uses `parseFloat` under the hood.

```ts
import { parseAsFloat } from 'nuqs'

useQueryState('float', parseAsFloat.withDefault(0))
```

<Suspense fallback={<DemoFallback />}>
  <FloatParserDemo />
</Suspense>

### Hexadecimal

Encodes integers in hexadecimal.

```ts
import { parseAsHex } from 'nuqs'

useQueryState('hex', parseAsHex.withDefault(0x00))
```

<Suspense fallback={<DemoFallback />}>
  <HexParserDemo />
</Suspense>

<Callout title="Going further">
  Check out the [Hex Colors](/playground/hex-colors) playground for a demo.
</Callout>

### Index

Same as integer, but adds a `+1` offset to the serialized querystring (and `-1` when parsing).
Useful for pagination indexes.

```ts
import { parseAsIndex } from 'nuqs'

const [pageIndex] = useQueryState('page', parseAsIndex.withDefault(0))
```

<Suspense fallback={<DemoFallback />}>
  <IndexParserDemo />
</Suspense>

## Boolean

```ts
import { parseAsBoolean } from 'nuqs'

useQueryState('bool', parseAsBoolean.withDefault(false))
```

<Suspense fallback={<DemoFallback />}>
  <BooleanParserDemo />
</Suspense>

## Literals

These parsers extend the basic integer and float parsers, but validate against
some expected values, defined as [TypeScript literals](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types).

```ts
import { parseAsStringLiteral, type inferParserType } from 'nuqs'

// Create parser
const parser = parseAsStringLiteral(['asc', 'desc'])

// Optional: extract the type
type SortOrder = inferParserType<typeof parser> // 'asc' | 'desc'
```

<Callout title="Should I declare values inline or outside the parser?">
  It depends®. Declaring them inline is shorter, and makes the parser
  the source of truth for type inference with `inferParserType{:ts}`,
  but it locks the values inside the parser.

  Declaring them outside allows reading and iterating over the values at runtime.
  Don’t forget to add `as const{:ts}` though, otherwise the type will widen as a `string{:ts}`.
</Callout>

### String literals

```ts
// [!code word:as const]
import { parseAsStringLiteral } from 'nuqs'

// List accepted values
const sortOrder = ['asc', 'desc'] as const

// Then pass it to the parser
parseAsStringLiteral(sortOrder)
```

<Suspense fallback={<DemoFallback />}>
  <StringLiteralParserDemo />
</Suspense>

### Numeric literals

```ts
import { parseAsNumberLiteral } from 'nuqs'

parseAsNumberLiteral([1, 2, 3, 4, 5, 6])
```

```ts
// [!code word:as const]
import { parseAsNumberLiteral } from 'nuqs'

// List accepted values
const diceSides = [1, 2, 3, 4, 5, 6] as const

// Then pass it to the parser
parseAsNumberLiteral(diceSides)
```

## Enums

String enums are a bit more verbose than string literals, but `nuqs` supports them.

```ts
enum Direction {
  up = 'UP',
  down = 'DOWN',
  left = 'LEFT',
  right = 'RIGHT'
}

parseAsStringEnum<Direction>(Object.values(Direction))
```

<Callout title="Note">
  The query string value will be the **value** of the enum, not its name (here:
  `?direction=UP`).
</Callout>

## Dates & timestamps

There are three parsers that give you a `Date` object, their difference is
on how they encode the value into the query string.

### ISO 8601 Datetime

```ts
import { parseAsIsoDateTime } from 'nuqs'
```

<Suspense>
  <DatetimeISOParserDemo />
</Suspense>

### ISO 8601 Date

<FeatureSupportMatrix introducedInVersion="2.1.0" />

```ts
import { parseAsIsoDate } from 'nuqs'
```

<Suspense>
  <DateISOParserDemo />
</Suspense>

<Callout>
  The Date is parsed without the time zone offset, making it at 00:00:00 UTC.
</Callout>

### Timestamp

Miliseconds since the Unix epoch.

```ts
import { parseAsTimestamp } from 'nuqs'
```

<Suspense>
  <DateTimestampParserDemo />
</Suspense>

## Arrays

All of the parsers on this page can be used to parse arrays of their respective types.

```ts
import { parseAsArrayOf, parseAsInteger } from 'nuqs'

parseAsArrayOf(parseAsInteger)

// Optionally, customise the separator
parseAsArrayOf(parseAsInteger, ';')
```

## JSON

If primitive types are not enough, you can encode JSON in the query string.

Pass it a [Standard Schema](https://standardschema.dev) (eg: a Zod schema)
to validate and infer the type of the parsed data:

```ts
// [!code word:parseAsJson]
import { parseAsJson } from 'nuqs'
import { z } from 'zod'

const schema = z.object({
  pkg: z.string(),
  version: z.number(),
  worksWith: z.array(z.string())
})

// This parser is a function, don't forget to call it
// with your schema as an argument.
const [json, setJson] = useQueryState('json', parseAsJson(schema))

setJson({
  pkg: 'nuqs',
  version: 2,
  worksWith: ['Next.js', 'React', 'Remix', 'React Router', 'and more']
})
```

<Suspense>
  <JsonParserDemo />
</Suspense>

Using other validation libraries is possible: `parseAsJson{:ts}` accepts
any Standard Schema compatible input (eg: ArkType, Valibot),
or a custom validation function (eg: Yup, Joi, etc):

```ts
import { object, string, number } from 'yup';

let userSchema = object({
  name: string().required(),
  age: number().required().positive().integer(),
});

parseAsJson(userSchema.validateSync)
```

<Callout title="Note">
  Validation functions must either throw an error or
  return `null{:ts}` for invalid data. Only **synchronous** validation is supported.
</Callout>

## Native Arrays

<FeatureSupportMatrix introducedInVersion="2.7.0" />

If you want to use the native URL format for arrays, repeating the same key multiple times like:

import { Querystring } from '@/src/components/querystring'

<Querystring path="/products" value="?tag=books&tag=tech&tag=design" />

you can now use `MultiParsers{:ts}` like `parseAsNativeArrayOf{:ts}` to read and write those values in a fully type-safe way.

```tsx
import { useQueryState, parseAsNativeArrayOf, parseAsInteger } from 'nuqs'

const [projectIds, setProjectIds] = useQueryState(
  'project',
  parseAsNativeArrayOf(parseAsInteger)
)

// ?project=123&project=456 → [123, 456]
```

<Suspense fallback={<DemoFallback />}>
  <NativeArrayParserDemo />
</Suspense>

<Callout title="Note: empty array default">
  `parseAsNativeArrayOf{:ts}` has a built-in default value of empty array (`.withDefault([]){:ts}`) so that you don’t have to handle `null{:ts}` cases.

  Calls to `.withDefault(){:ts}` can be chained, so you can use it to set a custom default.
</Callout>

## Using parsers server-side

For shared code that may be imported in the Next.js app router, you should import
parsers from `nuqs/server` to use them in both server & client code,
as it doesn’t include the `'use client'{:ts}` directive.

```ts
import { parseAsString } from 'nuqs/server'
```

Importing from `nuqs` will only work in client code, and will throw bundling errors
when using functions (like `.withDefault{:ts}` & `.withOptions{:ts}`)
across shared code.

For all other frameworks, you can use either interchangeably, as they don’t
care about the `'use client'{:ts}` directive.

---

# Custom parsers

URL (HTML): /docs/parsers/making-your-own
URL (LLMs): /docs/parsers/making-your-own.md
Source: https://raw.githubusercontent.com/47ng/nuqs/refs/heads/master/packages/docs/content/docs/parsers/making-your-own.mdx

Making your own parsers for custom data types & pretty URLs

import {
  CustomParserDemo,
  CustomMultiParserDemo
} from '@/content/docs/parsers/demos'

You may wish to customise the rendered query string for your data type.
For this, `nuqs` exposes the `createParser{:ts}` function to make your own parsers.

You pass it two functions:

1. `parse{:ts}`: a function that takes a string and returns the parsed value, or `null{:ts}` if invalid.
2. `serialize{:ts}`: a function that takes the parsed value and returns a string.

```ts
import { createParser } from 'nuqs'

const parseAsStarRating = createParser({
  // [!code word:parse]
  parse(queryValue) {
    const inBetween = queryValue.split('★')
    const isValid = inBetween.length > 1 && inBetween.every(s => s === '')
    if (!isValid) return null
    const numStars = inBetween.length - 1
    return Math.min(5, numStars)
  },
  // [!code word:serialize]
  serialize(value) {
    return Array.from({length: value}, () => '★').join('')
  }
})
```

<Suspense>
  <CustomParserDemo />
</Suspense>

## Equality function

For state types that can’t be compared by the `==={:ts}` operator, you’ll need to
provide an `eq{:ts}` function as well:

```ts

// Eg: TanStack Table sorting state
// /?sort=foo:asc → { id: 'foo', desc: false }
const parseAsSort = createParser({
  parse(query) {
    const [key = '', direction = ''] = query.split(':')
    const desc = parseAsStringLiteral(['asc', 'desc']).parse(direction) ?? 'asc'
    return {
      id: key,
      desc: desc === 'desc'
    }
  },
  serialize(value) {
    return `${value.id}:${value.desc ? 'desc' : 'asc'}`
  },
  // [!code highlight:3]
  eq(a, b) {
    return a.id === b.id && a.desc === b.desc
  }
})
```

This is used for the [`clearOnDefault{:ts}`](/docs/options#clear-on-default) option,
to check if the current value is equal to the default value.

## Custom Multi Parsers

The parsers we’ve seen until now are `SingleParsers{:ts}`: they operate on **the first occurence** of the
key in the URL, and give you a string value to parse when it’s available.

`MultiParsers{:ts}` work similar to `SingleParsers{:ts}`, except that they operate on arrays, to support **key repetition**:

import { Querystring } from '@/src/components/querystring'

<Querystring path="/" value="?tag=type-safe&tag=url-state&tag=react" />

This means:

1. `parse{:ts}` takes an `Array<string>{:ts}`. It receives all matching values of the key it operates on, and returns the parsed value, or `null{:ts}` if invalid.
2. `serialize{:ts}` takes the parsed value and returns an `Array<string>{:ts}`, where each item will be separately added to the URL.

You can then compose & reduce this array to form **complex data types**:

<Suspense>
  <CustomMultiParserDemo />
</Suspense>

```tsx
/**
 * 100~200 <=> { gte: 100, lte: 200 }
 * 150     <=> { eq: 150 }
 */
const parseAsFromTo = createParser({
  parse: value => {
    const [min = null, max = null] = value.split('~').map(parseAsInteger.parse)
    if (min === null) return null
    if (max === null) return { eq: min }
    return { gte: min, lte: max }
  },
  serialize: value => {
    return value.eq !== undefined ? String(value.eq) : `${value.gte}~${value.lte}`
  }
})

/**
 * foo:bar <=> { key: 'foo', value: 'bar' }
 */
const parseAsKeyValue = createParser({
  parse: value => {
    const [key, val] = value.split(':')
    if (!key || !val) return null
    return { key, value: val }
  },
  serialize: value => {
    return `${value.key}:${value.value}`
  }
})

const parseAsFilters = <TItem extends {}>(itemParser: SingleParser<TItem>) => {
  return createMultiParser({
    parse: values => {
      const keyValue = values.map(parseAsKeyValue.parse).filter(v => v !== null)

      const result = Object.fromEntries(
        keyValue.flatMap(({ key, value }) => {
          const parsedValue: TItem | null = itemParser.parse(value)
          return parsedValue === null ? [] : [[key, parsedValue]]
        })
      )

      return Object.keys(result).length === 0 ? null : result
    },
    serialize: values => {
      return Object.entries(values).map(([key, value]) => {
        if (!itemParser.serialize) return null
        return parseAsKeyValue.serialize({ key, value: itemParser.serialize(value) })
      }).filter(v => v !== null)
    }
  })
}

const [filters, setFilters] = useQueryState(
  'filters',
  parseAsFilters(parseAsFromTo).withDefault({})
)
```

## Caveat: lossy serializers

If your serializer loses precision or doesn’t accurately represent
the underlying state value, you will lose this precision when
reloading the page or restoring state from the URL (eg: on navigation).

Example:

```ts
const geoCoordParser = {
  parse: parseFloat,
  serialize: v => v.toFixed(4) // Loses precision
}

const [lat, setLat] = useQueryState('lat', geoCoordParser)
```

Here, setting a latitude of 1.23456789 will render a URL query string
of `lat=1.2345`, while the internal `lat` state will be correctly
set to 1.23456789.

Upon reloading the page, the state will be incorrectly set to 1.2345.

---

# TanStack Table Parsers

URL (HTML): /docs/parsers/community/tanstack-table
URL (LLMs): /docs/parsers/community/tanstack-table.md
Source: https://raw.githubusercontent.com/47ng/nuqs/refs/heads/master/packages/docs/content/docs/parsers/community/tanstack-table.mdx

Store your table state in the URL, with style.

[TanStack Table](https://tanstack.com/table) is a popular library for managing
tabular content in React (and other frameworks).

By default, it will store its state in memory, losing all filters, sorts and
pagination when the page is refreshed. This is a prime example where URL state
shines.

## Pagination

TanStack Table stores pagination under two pieces of state:

* `pageIndex`: a zero-based integer representing the current page
* `pageSize`: an integer representing the number of items per page

You will likely want the URL to follow your UI and be one-based for the page index:

import { TanStackTablePagination } from './tanstack-table.generator'

<Suspense>
  <TanStackTablePagination />
</Suspense>

## Filtering

<Callout>
  This section is empty for now, [contributions](https://github.com/47ng/nuqs) are welcome!
</Callout>

## Sorting

<Callout>
  This section is empty for now, [contributions](https://github.com/47ng/nuqs) are welcome!
</Callout>

---

# Effect Schema Parsers

URL (HTML): /docs/parsers/community/effect-schema
URL (LLMs): /docs/parsers/community/effect-schema.md
Source: https://raw.githubusercontent.com/47ng/nuqs/refs/heads/master/packages/docs/content/docs/parsers/community/effect-schema.mdx

Use Effect Schema to parse and serialize URL state.

[Effect](https://effect.website) is a popular TypeScript framework, with its own schema validation library: [Effect Schema](https://effect.website/docs/schema/introduction/)

Effect Schemas have the unique property of encoding two way transformations between different types. This makes them a perfect fit for using in a nuqs parser.

```ts
import { createParser } from 'nuqs'
import { Schema, Either, Equal } from 'effect'

function createSchemaParser<T, E extends string>(schema: Schema.Schema<T, E>) {
  const encoder = Schema.encodeUnknownEither(schema);
  const decoder = Schema.decodeUnknownEither(schema);
  return createParser({
    parse: (queryValue) => {
      const result = decoder(queryValue);
      return Either.getOrNull(result);
    },
    serialize: (value) => {
      const result = encoder(value);
      return Either.getOrThrowWith(
        result,
        (cause) =>
          new Error(`Failed to encode value: ${value}`, {
            cause,
          }),
      );
    },
    eq: (a, b) => Equal.equals(a, b),
  });
}
```

## Example

```ts
import { Schema } from 'effect'

class User extends Schema.Class<User>('User')({
  name: Schema.String,
  age: Schema.Positive
}) {}

const ToBase64UrlEncodedJson = Schema.compose(Schema.StringFromBase64Url, Schema.parseJson())
const schema = Schema.compose(ToBase64UrlEncodedJson, User)

const parser = createSchemaParser(schema).withDefault(new User({ name: 'John Vim', age: 25 }))

const [user, setUser] = useQueryState('user', parser)
```

## Interactive Demo

import { Suspense } from 'react'
import { EffectSchemaDemo } from './effect-schema-demo'

<Suspense>
  <EffectSchemaDemo />
</Suspense>

---

# Zod codecs

URL (HTML): /docs/parsers/community/zod-codecs
URL (LLMs): /docs/parsers/community/zod-codecs.md
Source: https://raw.githubusercontent.com/47ng/nuqs/refs/heads/master/packages/docs/content/docs/parsers/community/zod-codecs.mdx

Using Zod codecs for (de)serialisation in custom nuqs parser

Since `zod@^4.1`, you can use [codecs](https://zod.dev/codecs)
to add bidirectional serialisation / deserialisation to your validation schemas:

```ts
import { z } from 'zod'

// Similar to parseAsTimestamp in nuqs:
const dateTimestampCodec = z.codec(z.string().regex(/^\d+$/), z.date(), {
  decode: (query) => new Date(parseInt(query)),
  encode: (date) => date.valueOf().toFixed()
})
```

## Demo

<iframe src="https://www.youtube-nocookie.com/embed/k4lWvklUxUE" title="YouTube video player" frameBorder="0" allow="autoplay; encrypted-media; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen className="aspect-video w-full max-w-2xl mx-auto mb-8" />

import { ZodCodecsDemo } from './zod-codecs.demo'
import { ZodCodecsDemoSkeleton } from './zod-codecs.skeleton'
import { Suspense } from 'react'

<Suspense
  fallback={(
<ZodCodecsDemoSkeleton className='animate-pulse'>
  <div className='h-32 bg-muted/25 rounded-md flex items-center justify-center text-sm text-muted-foreground'>
    Loading demo…
  </div>
</ZodCodecsDemoSkeleton>
)}
>
  <ZodCodecsDemo />
</Suspense>

import { ZodCodecsSource } from './zod-codecs.source'

Source code:

<ZodCodecsSource />

## Refinements

The cool part is being able to add string constraints to the first type in a codec.
It has to be rooted as a string data type (because that’s what the URL
will give us), but you can add **refinements**:

```ts
z.codec(z.uuid(), ...)
z.codec(z.email(), ...)
z.codec(z.base64url(), ...)
```

See the [complete list](https://zod.dev/api?id=string-formats) of string-based
refinements you can use.

<Callout title="Caveats" type="warning">
  As stated in the Zod docs, you [cannot use transforms in codecs](https://zod.dev/codecs#transforms).
</Callout>

---

# Options

URL (HTML): /docs/options
URL (LLMs): /docs/options.md
Source: https://raw.githubusercontent.com/47ng/nuqs/refs/heads/master/packages/docs/content/docs/options.mdx

Configuring nuqs

By default, `nuqs` will update search params:

1. On the client only (not sending requests to the server),
2. by replacing the current history entry,
3. without scrolling to the top of the page.
4. with a throttle rate adapted to your browser

These default behaviours can be [configured](#global-defaults-override),
along with a few additional options.

## Passing options

Options can be passed at the hook level via the builder pattern:

```ts
// [!code word:withOptions]
const [state, setState] = useQueryState(
  'foo',
  parseAsString.withOptions({ history: 'push' })
)
```

Or when calling the state updater function, as a second parameter:

```ts
// [!code word:scroll]
setState('foo', { scroll: true })
```

Call-level options will override hook level options.

## History

By default, state updates are done by **replacing** the current history entry with
the updated query when state changes.

You can see this as a sort of `git squash{:shell}`, where all state-changing
operations are merged into a single browsing history entry.

You can also opt-in to **push** a new history entry for each state change,
per key, which will let you use the Back button to navigate state
updates:

```ts
// Append state changes to history:
// [!code word:history]
useQueryState('foo', { history: 'push' })
```

<Callout title="Watch out!" type="warn">
  Breaking the Back button can lead to a bad user experience. Make sure to use this
  option only if the search params to update contribute to a navigation-like
  experience (eg: tabs, modals). Overriding the Back behaviour must be a UX
  enhancement rather than a nuisance.

  *— “With great power comes great responsibility.”*
</Callout>

## Shallow

By default, query state updates are done in a *client-first* manner: there are
no network calls to the server.

This is equivalent to the `shallow` option of the Next.js router set to `true{:ts}`.

To opt-in to notifying the server on query updates, you can set `shallow` to `false{:ts}`:

```ts
// [!code word:shallow]
useQueryState('foo', { shallow: false })
```

Note that the shallow option only makes sense if your page can be server-side rendered.
Therefore, it has no effect in React SPA.

For server-side renderable frameworks, you would pair `shallow: false{:ts}` with:

* In Next.js app router: the `searchParams` page prop to render the RSC tree based on the updated query state.
* In Next.js pages router: the `getServerSideProps` function
* In Remix & React Router: a `loader` function

### In React Router based frameworks

While the `shallow: true{:ts}` default behaviour is uncommon for Remix and React Router,
where loaders are always supposed to run on URL changes, nuqs gives you control
of this behaviour, by opting in to running loaders only if they do need to access
the relevant search params.

One caveat is that the stock `useSearchParams{:ts}` hook from those frameworks doesn’t
reflect shallow-updated search params, so we provide you with one that does:

```tsx
import { useOptimisticSearchParams } from 'nuqs/adapters/remix' // or '…/react-router/v6' or '…/react-router/v7'

function Component() {
  // Note: this is read-only, but reactive to all URL changes
  const searchParams = useOptimisticSearchParams()
  return <div>{searchParams.get('foo')}</div>
}
```

This concept of *“shallow routing”* is done via updates to the browser’s
[History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API).

<Callout title="Why not using shouldRevalidate?">
  [`shouldRevalidate`](https://reactrouter.com/start/framework/route-module#shouldrevalidate)
  is the idomatic way of opting out of running loaders on navigation, but nuqs uses
  the opposite approach: opting in to running loaders only when needed.

  In order to avoid specifying `shouldRevalidate` for every route, nuqs chose to
  patch the history methods to enable shallow routing by default (on its own updates)
  in React Router based frameworks.
</Callout>

## Scroll

The Next.js router scrolls to the top of the page on navigation updates,
which may not be desirable when updating the query string with local state.

Query state updates won’t scroll to the top of the page by default, but you
can opt-in to this behaviour:

```ts
// [!code word:scroll]
useQueryState('foo', { scroll: true })
```

## Rate-limiting URL updates

Because of browsers rate-limiting the History API, updates **to the
URL** are queued and throttled to a default of 50ms, which seems to satisfy
most browsers even when sending high-frequency query updates, like binding
to a text input or a slider.

Safari’s rate limits are much stricter and use a default throttle of 120ms
(320ms for older versions of Safari).

<Callout title="Note">
  the state returned by the hook is always updated **instantly**, to keep UI responsive.
  Only changes to the URL, and server requests when using `shallow: false{:ts}`, are throttled or debounced.
</Callout>

This [throttle](#throttle) time is configurable, and also allows you to [debounce](#debounce) updates
instead.

<Callout title="Which one should I use?">
  Throttle will emit the first update immediately, then batch updates at a slower
  pace **regularly**. This is recommended for most low-frequency updates.

  Debounce will push back the moment when the URL is updated when you set your state,
  making it **eventually consistent**. This is recommended for high-frequency
  updates where the last value is more interesting than the intermediate ones,
  like a search input or moving a slider.

  Read more about [debounce vs throttle](https://kettanaito.com/blog/debounce-vs-throttle).
</Callout>

### Throttle

If you want to increase the throttle time — for example to reduce the amount
of requests sent to the server when paired with `shallow: false{:ts}` — you can
specify it under the `limitUrlUpdates{:ts}` option:

```ts
// [!code word:limitUrlUpdates]
useQueryState('foo', {
  // Send updates to the server maximum once every second
  shallow: false,
  limitUrlUpdates: {
    method: 'throttle',
    timeMs: 1000
  }
})

// or using the shorthand:
import { throttle } from 'nuqs'

useQueryState('foo', {
  shallow: false,
  limitUrlUpdates: throttle(1000)
})
```

If multiple hooks set different throttle values on the same event loop tick,
the highest value will be used. Also, values lower than 50ms will be ignored,
to avoid rate-limiting issues.
[Read more](https://francoisbest.com/posts/2023/storing-react-state-in-the-url-with-nextjs#batching--throttling).

Specifying a `+Infinity{:ts}` value for throttle time will **disable** updates to the
URL or the server, but all `useQueryState(s){:ts}` hooks will still update their
internal state and stay in sync with each other.

<Callout title="Deprecation notice">
  The `throttleMs{:ts}` option has been deprecated in `nuqs@2.5.0` and will be removed
  in a later major upgrade.

  To migrate:

  1. `import { throttle } from 'nuqs' {:ts}`
  2. Replace `{ throttleMs: 100 }{:ts}` with `{ limitUrlUpdates: throttle(100) }{:ts}` in your options.
</Callout>

### Debounce

<Callout type="warning" title="Do I need debounce?">
  Debounce only makes sense for **server-side data fetching** (RSCs & loaders, when combined with [`shallow: false{:ts}`](#shallow)),
  to control when requests are made to the server. For example: it lets you avoid sending the first
  character on its own when typing in a search input, by waiting for the user to finish typing.

  If you are **fetching client-side** (eg: with TanStack Query), you’ll want to debounce the
  state returned by the hooks instead (using a 3rd party `useDebounce` utility hook).
</Callout>

In addition to throttling, you can apply a debouncing mechanism to URL updates,
to delay the moment where the URL gets updated with the latest value.

<Callout>
  The returned state is always updated **immediately**: only the network requests
  sent to the server are debounced.
</Callout>

This can be useful for high frequency state updates where the server only cares about
the final value, not all the intermediary ones while typing in a search input
or moving a slider.

We recommend you opt-in to debouncing on specific state updates, rather than
defining it for the whole search param.

Let’s take the example of a search input. You’ll want to update it:

1. When the user is typing text, with debouncing
2. When the user clears the input, by sending an immediate update
3. When the user presses Enter, by sending an immediate update

You can see the debounce case is the outlier here, and actually conditioned on
the set value, so we can specify it using the state updater function:

```tsx
// [!code word:debounce:1]
import { useQueryState, parseAsString, debounce } from 'nuqs';

function Search() {
  const [search, setSearch] = useQueryState(
    'q',
    parseAsString
      .withDefault('')
      .withOptions({ shallow: false })
  )

  return (
    <input
      value={search}
      onChange={(e) =>
        setSearch(e.target.value, {
          // Send immediate update if resetting, otherwise debounce at 500ms
          // [!code word:debounce:1]
          limitUrlUpdates: e.target.value === '' ? undefined : debounce(500)
        })
      }
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          // Send immediate update
          setSearch(e.target.value)
        }
      }}
    />
  )
}
```

### Resetting

You can use the `defaultRateLimit{:ts}` import to reset debouncing or throttling to
the default:

```ts
// [!code word:defaultRateLimit]
import { debounce, defaultRateLimit } from 'nuqs'

const [, setState] = useQueryState('foo', {
  limitUrlUpdates: debounce(1000)
})

// This state update isn't debounced
setState('bar', { limitUrlUpdates: defaultRateLimit })
```

## Transitions

When combined with `shallow: false{:ts}`, you can use React’s `useTransition{:ts}` hook
to get loading states while the server is re-rendering server components with
the updated URL.

Pass in the `startTransition{:ts}` function from `useTransition{:ts}` to the options
to enable this behaviour:

```tsx
'use client'

import React from 'react'
import { useQueryState, parseAsString } from 'nuqs'

function ClientComponent({ data }) {
  // 1. Provide your own useTransition hook:
  // [!code word:startTransition:1]
  const [isLoading, startTransition] = React.useTransition()
  const [query, setQuery] = useQueryState(
    'query',
    // 2. Pass the `startTransition` as an option:
    // [!code word:startTransition:1]
    parseAsString.withOptions({ startTransition, shallow: false })
  )
  // 3. `isLoading` will be true while the server is re-rendering
  // and streaming RSC payloads, when the query is updated via `setQuery`.

  // Indicate loading state
  if (isLoading) return <div>Loading...</div>

  // Normal rendering with data
  return <div>...</div>
}
```

<Callout>
  In `nuqs@1.x.x`, passing `startTransition{:ts}` as an option automatically sets
  `shallow: false{:ts}`.

  This is no longer the case in `nuqs@>=2.0.0`: you’ll need to set it explicitly.
</Callout>

## Clear on default

When the state is set to the default value, the search parameter is
removed from the URL, instead of being reflected explicitly.

However, sometimes you might want to keep the search parameter in the URL,
because **default values *can* change**, and the meaning of the URL along with it.

<Callout title="Example of defaults changing">
  In `nuqs@1.x.x`, `clearOnDefault{:ts}` was `false{:ts}` by default.<br />
  in `nuqs@2.0.0`, `clearOnDefault{:ts}` is now `true{:ts}` by default, in response
  to [user feedback](https://x.com/fortysevenfx/status/1841610237540696261).
</Callout>

If you want to keep the search parameter in the URL when it’s set to the default
value, you can set `clearOnDefault{:ts}` to `false{:ts}`:

```ts
// [!code word:clearOnDefault]
useQueryState('search', {
  defaultValue: '',
  clearOnDefault: false
})
```

<Callout title="Tip">
  Clearing the key-value pair from the query string can always be done by setting the state to `null{:ts}`.
</Callout>

This option compares the set state against the default value using `==={:ts}`
reference equality, so if you are using a [custom parser](/docs/parsers/making-your-own)
for a state type that wouldn’t work with reference equality, you should provide
the `eq{:ts}` function to your parser (this is done for you in built-in parsers):

```ts
const dateParser = createParser({
  parse: (value: string) => new Date(value.slice(0, 10)),
  serialize: (date: Date) => date.toISOString().slice(0, 10),
  eq: (a: Date, b: Date) => a.getTime() === b.getTime() // [!code highlight]
})
```

## Adapter props

The following options are global and can be passed directly
on the [`<NuqsAdapter>{:tsx}`](/docs/adapters) as props, and apply to its whole
children tree.

### Global defaults override

<FeatureSupportMatrix introducedInVersion="2.5.0" />

Default values for some options can be configured globally via the `defaultOptions{:ts}`
adapter prop:

```tsx
// [!code word:defaultOptions]
<NuqsAdapter
  defaultOptions={{
    shallow: false,
    scroll: true,
    clearOnDefault: false,
    limitUrlUpdates: throttle(250),
  }}
>
  {children}
</NuqsAdapter>
```

### Processing `URLSearchParams`

<FeatureSupportMatrix introducedInVersion="2.6.0" />

You can pass a `processUrlSearchParams{:ts}` callback to the adapter,
which will be called *after* the `URLSearchParams{:ts}` have been merged
when performing a state update, and *before* they are sent to the adapter
for updating the URL.

Think of it as a sort of **middleware** for processing search params.

#### Alphabetical Sort

Sort the search parameters alphabetically:

```tsx
// [!code word:processUrlSearchParams]
<NuqsAdapter
  processUrlSearchParams={(search) => {
    // Note: you can modify search in-place,
    // or return a copy, as you wish.
    search.sort()
    return search
  }}
>
  {children}
</NuqsAdapter>
```

import { Suspense } from 'react'
import { AlphabeticalSortDemo, DemoSkeleton } from './options.client'

*Try toggling **c**, then **b**, then **a**, and note how the URL remains ordered:*

<Suspense fallback={<DemoSkeleton/>}>
  <AlphabeticalSortDemo />
</Suspense>

#### Timestamp

Add a timestamp to the search parameters:

```tsx
// [!code word:processUrlSearchParams]
<NuqsAdapter
  processUrlSearchParams={(search) => {
    search.set('ts', Date.now().toString())
    return search
  }}
>
  {children}
</NuqsAdapter>
```

import { TimestampDemo } from './options.client'

<Suspense fallback={<DemoSkeleton/>}>
  <TimestampDemo />
</Suspense>

---

# useQueryStates

URL (HTML): /docs/batching
URL (LLMs): /docs/batching.md
Source: https://raw.githubusercontent.com/47ng/nuqs/refs/heads/master/packages/docs/content/docs/batching.mdx

How to read & update multiple search params at once

## Multiple updates (batching)

You can call as many state update functions as needed in a single event loop
tick, and they will be applied to the URL asynchronously:

```ts
const MultipleQueriesDemo = () => {
  const [lat, setLat] = useQueryState('lat', parseAsFloat)
  const [lng, setLng] = useQueryState('lng', parseAsFloat)
  const randomCoordinates = React.useCallback(() => {
    setLat(Math.random() * 180 - 90)
    setLng(Math.random() * 360 - 180)
  }, [])
}
```

If you wish to know when the URL has been updated, and what it contains, you can
await the Promise returned by the state updater function, which gives you the
updated URLSearchParameters object:

```ts
const randomCoordinates = React.useCallback(() => {
  setLat(42)
  return setLng(12)
}, [])

randomCoordinates().then((search: URLSearchParams) => {
  search.get('lat') // 42
  search.get('lng') // 12, has been queued and batch-updated
})
```

<details>
  <summary>
    <em>Implementation details (Promise caching)</em>
  </summary>

  The returned Promise is cached until the next flush to the URL occurs,
  so all calls to a setState (of any hook) in the same event loop tick will
  return the same Promise reference.

  Due to throttling of calls to the Web History API, the Promise may be cached
  for several ticks. Batched updates will be merged and flushed once to the URL.
  This means not every setState will reflect to the URL, if another one comes
  overriding it before flush occurs.

  The returned React state will reflect all set values instantly,
  to keep UI responsive.

  ***
</details>

## `useQueryStates`

For query keys that should always move together, you can use `useQueryStates`
with an object containing each key’s type:

```ts
import { useQueryStates, parseAsFloat } from 'nuqs'

const [coordinates, setCoordinates] = useQueryStates(
  {
    lat: parseAsFloat.withDefault(45.18),
    lng: parseAsFloat.withDefault(5.72)
  },
  {
    history: 'push'
  }
)

const { lat, lng } = coordinates

// Set all (or a subset of) the keys in one go:
const search = await setCoordinates({
  lat: Math.random() * 180 - 90,
  lng: Math.random() * 360 - 180
})
```

### Options

There are three places you can define [options](/docs/options) in `useQueryStates`:

* As the second argument to the hook itself (global options, like `history: 'push'{:ts}` above)
* On each parser, like `parseAsFloat.withOptions({ shallow: false }){:ts}`
* At the call level when updating the state:

```ts
setCoordinates(
  {
    lat: 42,
    lng: 12
  },
  // [!code highlight:3]
  {
    shallow: false
  }
)
```

The order of precedence is: call-level options > parser options > global options.

<Callout title="Tip">
  You can clear all keys managed by a `useQueryStates{:ts}` hook by passing
  `null{:ts}` to the state updater function:

  ```ts
  const clearAll = () => setCoordinates(null)
  ```

  This will clear `lat` & `lng`, and leave other search params untouched.
</Callout>

### Shorter search params keys

<FeatureSupportMatrix
  introducedInVersion="1.20.0"
  support={{
  supported: false,
  frameworks: ['TanStack Router']
}}
  highlightUnsupported
/>

One issue with tying the parsers object keys to the search params keys was that
you had to trade-off between variable names that make sense for your domain
or business logic, and short, URL-friendly keys.

You can use a `urlKeys{:ts}` object in the hook options
to remap the variable names to shorter keys:

```ts
const [{ latitude, longitude }, setCoordinates] = useQueryStates(
  {
    // Use variable names that make sense in your codebase
    latitude: parseAsFloat.withDefault(45.18),
    longitude: parseAsFloat.withDefault(5.72)
  },
  {
    urlKeys: {
      // And remap them to shorter keys in the URL
      latitude: 'lat',
      longitude: 'lng'
    }
  }
)

// No changes in the setter API, but the keys are remapped to:
// ?lat=45.18&lng=5.72
setCoordinates({
  latitude: 45.18,
  longitude: 5.72
})
```

As your application grows, you may want to reuse these parsers and urlKeys
definitions across multiple components or nuqs features
(like [loaders](/docs/server-side#loaders) or a [serializer](/docs/utilities#serializer-helper)).

You can use the `UrlKeys{:ts}` type helper for this:

```ts
// [!code word:UrlKeys]
import { type UrlKeys } from 'nuqs' // or 'nuqs/server'

export const coordinatesParsers = {
  latitude: parseAsFloat.withDefault(45.18),
  longitude: parseAsFloat.withDefault(5.72)
}

export const coordinatesUrlKeys: UrlKeys<typeof coordinatesParsers> = {
  latitude: 'lat',
  longitude: 'lng'
}
```

<FeatureSupportMatrix introducedInVersion="2.3.0" hideFrameworks />

---

# Server-Side usage

URL (HTML): /docs/server-side
URL (LLMs): /docs/server-side.md
Source: https://raw.githubusercontent.com/47ng/nuqs/refs/heads/master/packages/docs/content/docs/server-side.mdx

Type-safe search params on the server

## Loaders

<FeatureSupportMatrix introducedInVersion="2.3.0" />

To parse search params server-side, you can use a *loader* function.

You create one using the `createLoader{:ts}` function, by passing it your search params
descriptor object:

```tsx title="searchParams.tsx"
// [!code word:createLoader]
import { parseAsFloat, createLoader } from 'nuqs/server'

// Describe your search params, and reuse this in useQueryStates / createSerializer:
export const coordinatesSearchParams = {
  latitude: parseAsFloat.withDefault(0),
  longitude: parseAsFloat.withDefault(0)
}

export const loadSearchParams = createLoader(coordinatesSearchParams)
```

Here, `loadSearchParams{:ts}` is a function that parses search params and returns
state variables to be consumed server-side (the same state type that [`useQueryStates{:ts}`](/docs/batching) returns).

<Tabs items={["Next.js (app router)", "Next.js (pages router)", "API routes", "Remix / React Router", "React / client-side"]}>
  <>
    <Tab value="Next.js (app router)">
      ```tsx  title="app/page.tsx"
      // [!code word:loadSearchParams]
      import { loadSearchParams } from './search-params'
      import type { SearchParams } from 'nuqs/server'

      type PageProps = {
        searchParams: Promise<SearchParams>
      }

      export default async function Page({ searchParams }: PageProps) {
        const { latitude, longitude } = await loadSearchParams(searchParams)
        return <Map
          lat={latitude}
          lng={longitude}
        />

        // Pro tip: you don't *have* to await the result.
        // Pass the Promise object to children components wrapped in <Suspense>
        // to benefit from PPR / dynamicIO and serve a static outer shell
        // immediately, while streaming in the dynamic parts that depend on
        // the search params when they become available.
      }
      ```
    </Tab>

    <Tab value="Next.js (pages router)">
      ```ts  title="pages/index.tsx"
      // [!code word:loadSearchParams]
      import type { GetServerSidePropsContext } from 'next'

      export async function getServerSideProps({ query }: GetServerSidePropsContext) {
        const { latitude, longitude } = loadSearchParams(query)
        // Do some server-side calculations with the coordinates
        return {
          props: { ... }
        }
      }
      ```
    </Tab>

    <Tab value="Remix / React Router">
      ```tsx  title="app/routes/_index.tsx"
      // [!code word:loadSearchParams]
      export function loader({ request }: LoaderFunctionArgs) {
        const { latitude, longitude } = loadSearchParams(request) // request.url works too
        // Do some server-side calculations with the coordinates
        return ...
      }
      ```
    </Tab>

    <Tab value="React / client-side">
      ```tsx
      // Note: you can also use this client-side (or anywhere, really),
      // for a one-off parsing of non-reactive search params:

      loadSearchParams('https://example.com?latitude=42&longitude=12')
      loadSearchParams(location.search)
      loadSearchParams(new URL(...))
      loadSearchParams(new URLSearchParams(...))
      ```
    </Tab>

    <Tab value="API routes">
      ```tsx
      // App router, eg: app/api/location/route.ts
      export async function GET(request: Request) {
        const { latitude, longitude } = loadSearchParams(request)
        // ...
      }

      // Pages router, eg: pages/api/location.ts
      import type { NextApiRequest, NextApiResponse } from 'next'
      export default function handler(
        request: NextApiRequest,
        response: NextApiResponse
      ) {
        const { latitude, longitude } = loadSearchParams(request.query)
      }
      ```
    </Tab>
  </>
</Tabs>

<Callout type="warn" title="Note">
  Loaders **don’t validate** your data. If you expect positive integers
  or JSON-encoded objects of a particular shape, you’ll need to feed the result
  of the loader to a schema validation library, like [Zod](https://zod.dev).

  Built-in validation support is coming. [Read the RFC](https://github.com/47ng/nuqs/discussions/446).
  Alternatively, you can build validation into [custom parsers](/docs/parsers/making-your-own).
</Callout>

The loader function will accept the following input types to parse search params from:

* A string containing a fully qualified URL: `https://example.com/?foo=bar`
* A string containing just search params: `?foo=bar` (like `location.search{:ts}`)
* A `URL{:ts}` object
* A `URLSearchParams{:ts}` object
* A `Request{:ts}` object
* A `Record<string, string | string[] | undefined>{:ts}` (eg: `{ foo: 'bar' }{:ts}`)
* A `Promise{:ts}` of any of the above, in which case it also returns a Promise.

### Strict mode

<FeatureSupportMatrix introducedInVersion="2.5.0" />

If a search param contains an invalid value for the associated parser (eg: `?count=banana` for `parseAsInteger{:ts}`),
the default behaviour is to return the [default value](/docs/basic-usage#default-values) if specified, or `null{:ts}` otherwise.

You can turn on **strict mode** to instead throw an error on invalid values when running the loader:

```ts
const loadSearchParams = createLoader({
  count: parseAsInteger.withDefault(0)
})

// Default: will return { count: 0 }
loadSearchParams('?count=banana')

// Strict mode: will throw an error
loadSearchParams('?count=banana', { strict: true })
// [nuqs] Error while parsing query `banana` for key `count`
```

## Cache

<FeatureSupportMatrix introducedInVersion="1.13.0" support={{ supported: true, frameworks: ['Next.js (app router)']}} />

If you wish to access the searchParams in a deeply nested Server Component
(ie: not in the Page component), you can use `createSearchParamsCache{:ts}`
to do so in a type-safe manner.

Think of it as a loader combined with a way to propagate the parsed values down
the RSC tree, like Context would on the client.

```ts title="searchParams.ts"
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString
} from 'nuqs/server'
// Note: import from 'nuqs/server' to avoid the "use client" directive

export const searchParamsCache = createSearchParamsCache({
  // List your search param keys and associated parsers here:
  q: parseAsString.withDefault(''),
  maxResults: parseAsInteger.withDefault(10)
})
```

```tsx title="page.tsx"
import { searchParamsCache } from './searchParams'
import { type SearchParams } from 'nuqs/server'

type PageProps = {
  searchParams: Promise<SearchParams> // Next.js 15+: async searchParams prop
}

export default async function Page({ searchParams }: PageProps) {
  // ⚠️ Don't forget to call `parse` here.
  // You can access type-safe values from the returned object:
  const { q: query } = await searchParamsCache.parse(searchParams)
  return (
    <div>
      <h1>Search Results for {query}</h1>
      <Results />
    </div>
  )
}

function Results() {
  // Access type-safe search params in children server components:
  const maxResults = searchParamsCache.get('maxResults')
  return <span>Showing up to {maxResults} results</span>
}
```

The cache will only be valid for the current page render
(see React’s [`cache`](https://react.dev/reference/react/cache) function).

Note: the cache only works for **server components**, but you may share your
parser declaration with `useQueryStates` for type-safety in client components:

```ts title="searchParams.ts"
import {
  parseAsFloat,
  createSearchParamsCache
} from 'nuqs/server'

export const coordinatesParsers = {
  lat: parseAsFloat.withDefault(45.18),
  lng: parseAsFloat.withDefault(5.72)
}
export const coordinatesCache = createSearchParamsCache(coordinatesParsers)

```

```tsx title="page.tsx"
import { coordinatesCache } from './searchParams'
import { Server } from './server'
import { Client } from './client'

export default async function Page({ searchParams }) {
  // Note: you can also use strict mode here:
  await coordinatesCache.parse(searchParams, { strict: true })
  return (
    <>
      <Server />
      <Suspense>
        <Client />
      </Suspense>
    </>
  )
}

```

```tsx title="server.tsx"
import { coordinatesCache } from './searchParams'

export function Server() {
  const { lat, lng } = coordinatesCache.all()
  // or access keys individually:
  const lat = coordinatesCache.get('lat')
  const lng = coordinatesCache.get('lng')
  return (
    <span>
      Latitude: {lat} - Longitude: {lng}
    </span>
  )
}

```

```tsx title="client.tsx"
'use client'

import { useQueryStates } from 'nuqs'
import { coordinatesParsers } from './searchParams'

export function Client() {
  const [{ lat, lng }, setCoordinates] = useQueryStates(coordinatesParsers)
  // ...
}
```

### Shorter search params keys

Just like with `useQueryStates{:ts}`, you can
define a [`urlKeys{:ts}`](/docs/batching#shorter-search-params-keys) object to map the variable names defined by the parser to
shorter keys in the URL. They will be translated on read and your codebase
can only refer to variable names that make sense for your domain or business logic.

```ts title="searchParams.ts"
export const coordinatesParsers = {
  // Use human-readable variable names throughout your codebase
  latitude: parseAsFloat.withDefault(45.18),
  longitude: parseAsFloat.withDefault(5.72)
}
export const coordinatesCache = createSearchParamsCache(coordinatesParsers, {
  urlKeys: {
    // Remap them to read from shorter keys in the URL
    latitude: 'lat',
    longitude: 'lng'
  }
})
```

---

# Limits

URL (HTML): /docs/limits
URL (LLMs): /docs/limits.md
Source: https://raw.githubusercontent.com/47ng/nuqs/refs/heads/master/packages/docs/content/docs/limits.mdx

There are some limits you should be aware of when using nuqs or URL params in general.

## URL update throttling

Browsers rate-limit the History API, updates to the URL are queued and throttled to a default of 50ms, which seems to satisfy most browsers even when sending high-frequency query updates, like binding to a text input or a slider.

Safari’s rate limits are much stricter and require a throttle of 120ms (320ms for older versions of Safari).

Nuqs handles this out of the box so you don’t run into those rate-limits, however it is possible to set your own custom throttles.

For more info how to set custom throttles see [Rate-limiting URL updates](/docs/options#rate-limiting-url-updates).

## Max URL lengths

Most modern browsers enforce a max URL length, which can vary:

* **Chrome:** \~2 MB (practically, you might encounter issues at around 2,000 characters).
* **Firefox:** \~65,000 characters.
* **Safari:** Generally has more restrictive limits (around 80,000 characters).
* **IE/Edge:** Historically limited to 2,083 characters (IE), although Edge has relaxed this limit.

Additionally, transport mechanisms like social media, messaging apps, and emails may impose significantly lower limits on URL length. Long URLs may be truncated, wrapped, or rendered unusable when shared on these platforms.

Keep in mind that not all application state should be stored in URLs. Exceeding the 2,000-character range may indicate the need to reconsider your state management approach.

---

# Utilities

URL (HTML): /docs/utilities
URL (LLMs): /docs/utilities.md
Source: https://raw.githubusercontent.com/47ng/nuqs/refs/heads/master/packages/docs/content/docs/utilities.mdx

Utilities for working with query strings

## Serializer helper

<FeatureSupportMatrix introducedInVersion="1.16.0" hideFrameworks />

To populate `<Link>{:tsx}` components with state values, you can use the `createSerializer{:ts}`
helper.

Pass it an object describing your search params, and it will give you a function
to call with values, that generates a query string serialized as the hooks would do.

Example:

```ts
// [!code word:createSerializer]
import {
  createSerializer,
  parseAsInteger,
  parseAsIsoDateTime,
  parseAsString,
  parseAsStringLiteral
} from 'nuqs/server' // can also be imported from 'nuqs' in client code

const searchParams = {
  search: parseAsString,
  limit: parseAsInteger,
  from: parseAsIsoDateTime,
  to: parseAsIsoDateTime,
  sortBy: parseAsStringLiteral(['asc', 'desc'])
}

// Create a serializer function by passing the description of the search params to accept
const serialize = createSerializer(searchParams)

// Then later, pass it some values (a subset) and render them to a query string
serialize({
  search: 'foo bar',
  limit: 10,
  from: new Date('2024-01-01'),
  // here, we omit `to`, which won't be added
  sortBy: null // null values are also not rendered
})
// ?search=foo+bar&limit=10&from=2024-01-01T00:00:00.000Z
```

### Base parameter

The returned `serialize{:ts}` function can take a base parameter over which to
append/amend the search params:

```ts
serialize('/path?baz=qux', { foo: 'bar' }) // /path?baz=qux&foo=bar

const search = new URLSearchParams('?baz=qux')
serialize(search, { foo: 'bar' }) // ?baz=qux&foo=bar

const url = new URL('https://example.com/path?baz=qux')
serialize(url, { foo: 'bar' }) // https://example.com/path?baz=qux&foo=bar

// Passing null removes existing values
serialize('?remove=me', { foo: 'bar', remove: null }) // ?foo=bar
```

### Shorter search params keys

Just like with `useQueryStates{:ts}`, you can
define a [`urlKeys{:ts}`](/docs/batching#shorter-search-params-keys)
object to map the variable names defined by the parsers to shorter keys in the URL:

```ts
const serialize = createSerializer(
  {
    // 1. Use variable names that make sense for your domain/business logic
    latitude: parseAsFloat,
    longitude: parseAsFloat,
    zoomLevel: parseAsInteger
  },
  {
    // 2. Remap them to shorter keys in the URL
    urlKeys: {
      latitude: 'lat',
      longitude: 'lng',
      zoomLevel: 'z'
    }
  }
)

// 3. Use your variable names when calling the serializer,
// and the shorter keys will be rendered in the URL:
serialize({
  latitude: 45.18,
  longitude: 5.72,
  zoomLevel: 12
})
// ?lat=45.18&lng=5.72&z=12
```

### Processing URLSearchParams

<FeatureSupportMatrix introducedInVersion="2.6.0" />

Just like in the [`<NuqsAdapter>{:tsx}`](/docs/options#processing-urlsearchparams),
you can specify a `processUrlSearchParams{:ts}` function
to modify the search params before they are serialized.

For example, it can be useful for consistent canonical URLs (for SEO),
by sorting search param keys alphabetically:

```ts
// [!code word:processUrlSearchParams]
const serialize = createSerializer(
  {
    a: parseAsInteger,
    z: parseAsInteger
  },
  {
    processUrlSearchParams: (search) => {
      // Note: you can modify search in-place,
      // or return a copy, as you wish.
      search.sort()
      return search
    }
  }
)

serialize('?foo=bar', {
  a: 1,
  z: 1
})
// ?a=1&foo=bar&z=1
// merged, then sorted
```

## Parser type inference

<FeatureSupportMatrix introducedInVersion="1.18.0" />

To access the underlying type returned by a parser, you can use the
`inferParserType{:ts}` type helper:

```ts
import { parseAsInteger, type inferParserType } from 'nuqs' // or 'nuqs/server'

const intNullable = parseAsInteger
const intNonNull = parseAsInteger.withDefault(0)

inferParserType<typeof intNullable> // number | null
inferParserType<typeof intNonNull> // number
```

For an object describing parsers (that you’d pass to [`createLoader{:ts}`](/docs/server-side#loaders)
or to [`useQueryStates{:ts}`](/docs/batching#usequerystates)), `inferParserType{:ts}` will
return the type of the object with the parsers replaced by their inferred types:

```ts
import {
  parseAsBoolean,
  parseAsInteger,
  type inferParserType
} from 'nuqs' // or 'nuqs/server'

const parsers = {
  a: parseAsInteger,
  b: parseAsBoolean.withDefault(false)
}

inferParserType<typeof parsers>
// { a: number | null, b: boolean }
```

## Standard Schema

<FeatureSupportMatrix introducedInVersion="2.5.0" />

Search param definitions can be turned into a [Standard Schema](https://standardschema.dev)
for validating external sources and passing on type inference to other tools.

```ts
// [!code word:validateSearchParams]
import {
  createStandardSchemaV1,
  parseAsInteger,
  parseAsString,
} from 'nuqs' // or 'nuqs/server'

// 1. Define your search params as usual
export const searchParams = {
  searchTerm: parseAsString.withDefault(''),
  maxResults: parseAsInteger.withDefault(10)
}

// 2. Then create a Standard Schema compatible validator
export const validateSearchParams = createStandardSchemaV1(searchParams)

// 3. Use it with other tools, like tRPC:
router({
  search: publicProcedure.input(validateSearchParams).query(...)
})
```

### TanStack Router & validateSearch

You can pass the standard schema validator to
[TanStack Router](https://tanstack.com/router/)’s `validateSearch{:ts}` for type-safe
linking to nuqs URL state, but in order to keep those
values optional (as nuqs uses different defaults strategies
than TSR), you need to mark the output as `Partial{:ts}`,
using the `partialOutput{:ts}` option:

```ts title="src/routes/search.tsx"
// [!code word:partialOutput]
import { createStandardSchemaV1 } from 'nuqs'

const validateSearch = createStandardSchemaV1(searchParams, {
  partialOutput: true
})

export const Route = createFileRoute('/search')({
  validateSearch
})
```

<Callout title="Note" type="warn">
  TanStack Router support is still experimental and comes with caveats,
  see the [adapter documentation](/docs/adapters#tanstack-router) for more
  information about what is supported.
</Callout>

---

# Debugging

URL (HTML): /docs/debugging
URL (LLMs): /docs/debugging.md
Source: https://raw.githubusercontent.com/47ng/nuqs/refs/heads/master/packages/docs/content/docs/debugging.mdx

Enabling debug logs and user timings markers

## Browser

You can enable debug logs in the browser by setting the `debug` item in localStorage
to `nuqs`, and reload the page.

```js
// In your devtools:
localStorage.setItem('debug', 'nuqs')
```

Log lines for both `useQueryState` and `useQueryStates` will be prefixed with
`[nuq+]`, along with other internal debug logs.

> Note: unlike the `debug` package, this will not work with wildcards, but
> you can combine it: `localStorage.setItem('debug', '*,nuqs')`

## Server (Node.js)

Debug logs apply in any Node environment: server-side rendering (SSR), React
Server Components (RSC), or when using `nuqs/server`. Hooks like
`useQueryState` and `useQueryStates` can run on the server in these contexts.
Enable logs by setting the `DEBUG` environment variable so it contains `nuqs`:

```bash
DEBUG=nuqs node server.js
```

Or when running your development server:

```bash
DEBUG=nuqs pnpm dev
```

You can also define `DEBUG=nuqs` in your `.env` file or configure it through
your hosting environment.

Unlike the browser version, this does not use `localStorage`. Debug mode is
enabled when `process.env.DEBUG` contains the string `nuqs`.

User timings markers are also recorded, for advanced performance analysis using
your browser’s devtools.

Providing debug logs when opening an [issue](https://github.com/47ng/nuqs/issues)
is always appreciated. 🙏

---

# Testing

URL (HTML): /docs/testing
URL (LLMs): /docs/testing.md
Source: https://raw.githubusercontent.com/47ng/nuqs/refs/heads/master/packages/docs/content/docs/testing.mdx

Some tips on testing components that use `nuqs`

Since nuqs 2, you can unit-test components that use `useQueryState(s){:ts}` hooks
without needing to mock anything, by using a dedicated testing adapter that will
facilitate **setting up** your tests (with initial search params) and **asserting**
on URL changes when **acting** on your components.

## Testing hooks with React Testing Library

When testing hooks that rely on nuqs’ `useQueryState(s){:ts}` with React Testing Library’s
[`renderHook{:ts}`](https://testing-library.com/docs/react-testing-library/api/#renderhook) function,
you can use `withNuqsTestingAdapter{:ts}` to get a wrapper component to pass to the
`renderHook{:ts}` call:

```tsx
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing'

const { result } = renderHook(() => useTheHookToTest(), {
  wrapper: withNuqsTestingAdapter({
    searchParams: { count: "42" },
  }),
})
```

<FeatureSupportMatrix introducedInVersion="2.2.0" hideFrameworks />

## Testing components with Vitest

Here is an example for Vitest and Testing Library to test a button rendering
a counter:

<Tabs items={['Vitest v1', 'Vitest v2']}>
  <>
    <Tab value="Vitest v1">
      ```tsx title="counter-button.test.tsx" 
      // [!code word:withNuqsTestingAdapter]
      import { render, screen } from '@testing-library/react'
      import userEvent from '@testing-library/user-event'
      import { withNuqsTestingAdapter, type UrlUpdateEvent } from 'nuqs/adapters/testing'
      import { describe, expect, it, vi } from 'vitest'
      import { CounterButton } from './counter-button'

      it('should increment the count when clicked', async () => {
        const user = userEvent.setup()
        const onUrlUpdate = vi.fn<[UrlUpdateEvent]>()
        render(<CounterButton />, {
          // 1. Setup the test by passing initial search params / querystring:
          wrapper: withNuqsTestingAdapter({ searchParams: '?count=42', onUrlUpdate })
        })
        // 2. Act
        const button = screen.getByRole('button')
        await user.click(button)
        // 3. Assert changes in the state and in the (mocked) URL
        expect(button).toHaveTextContent('count is 43')
        expect(onUrlUpdate).toHaveBeenCalledOnce()
        const event = onUrlUpdate.mock.calls[0]![0]!
        expect(event.queryString).toBe('?count=43')
        expect(event.searchParams.get('count')).toBe('43')
        expect(event.options.history).toBe('push')
      })
      ```
    </Tab>

    <Tab value="Vitest v2">
      ```tsx title="counter-button.test.tsx" 
      // [!code word:withNuqsTestingAdapter]
      import { render, screen } from '@testing-library/react'
      import userEvent from '@testing-library/user-event'
      import { withNuqsTestingAdapter, type OnUrlUpdateFunction } from 'nuqs/adapters/testing'
      import { describe, expect, it, vi } from 'vitest'
      import { CounterButton } from './counter-button'

      it('should increment the count when clicked', async () => {
        const user = userEvent.setup()
        const onUrlUpdate = vi.fn<OnUrlUpdateFunction>()
        render(<CounterButton />, {
          // 1. Setup the test by passing initial search params / querystring:
          wrapper: withNuqsTestingAdapter({ searchParams: '?count=42', onUrlUpdate })
        })
        // 2. Act
        const button = screen.getByRole('button')
        await user.click(button)
        // 3. Assert changes in the state and in the (mocked) URL
        expect(button).toHaveTextContent('count is 43')
        expect(onUrlUpdate).toHaveBeenCalledOnce()
        const event = onUrlUpdate.mock.calls[0]![0]!
        expect(event.queryString).toBe('?count=43')
        expect(event.searchParams.get('count')).toBe('43')
        expect(event.options.history).toBe('push')
      })
      ```
    </Tab>
  </>
</Tabs>

See issue [#259](https://github.com/47ng/nuqs/issues/259) for more testing-related discussions.

## Jest and ESM

Since nuqs 2 is an [ESM-only package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c),
there are a few hoops you need to jump through to make it work with Jest.
This is extracted from the [Jest ESM guide](https://jestjs.io/docs/ecmascript-modules).

1. Add the following options to your jest.config.ts file:

```ts title="jest.config.ts"
const config: Config = {
  // <Other options here>
  // [!code highlight:2]
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  transform: {}
};
```

2. Change your test command to include the `--experimental-vm-modules` flag:

```json title="package.json"
// [!code word:--experimental-vm-modules]
{
  "scripts": {
    "test": "NODE_OPTIONS=\"$NODE_OPTIONS --experimental-vm-modules\" jest"
  }
}
```

<Callout>
  Adapt accordingly for Windows with [`cross-env`](https://www.npmjs.com/package/cross-env).
</Callout>

## API

`withNuqsTestingAdapter{:ts}` accepts the following arguments:

* `searchParams{:ts}`: The initial search params to use for the test. These can be a
  query string, a `URLSearchParams` object or a record object with string values.

```tsx
withNuqsTestingAdapter({
  searchParams: '?q=hello&limit=10'
})

withNuqsTestingAdapter({
  searchParams: new URLSearchParams('?q=hello&limit=10')
})

withNuqsTestingAdapter({
  searchParams: {
    q: 'hello',
    limit: '10' // Values are serialized strings
  }
})
```

* `onUrlUpdate{:ts}`: a function that will be called when the URL is updated
  by the component. It receives an object with:
  * the new search params as an instance of `URLSearchParams{:ts}`
  * the new rendered query string (for convenience)
  * the options used to update the URL.

* `hasMemory{:ts}`: by default, the testing adapter is **immutable**,
  meaning it will always use the initial search params as a base for URL
  updates. This encourages testing units of behaviour in a single test.

To make it behave like framework adapters (which do store the
updates in the URL), set `hasMemory: true{:ts}`, so subsequent updates
build up on the previous state. This memory is per-adapter instance,
and so is isolated between tests, but shared for components under the same
adapter.

<details>
  <summary className="cursor-pointer">
    🧪 Internal/advanced options
  </summary>

  * `rateLimitFactor{:ts}`. By default, rate limiting is disabled when testing,
    as it can lead to unexpected behaviours. Setting this to 1 will enable rate
    limiting with the same factor as in production.

  * `resetUrlUpdateQueueOnMount{:ts}`: clear the URL update queue before running the test.
    This is `true{:ts}` by default to isolate tests, but you can set it to `false{:ts}` to keep the
    URL update queue between renders and match the production behaviour more closely.
</details>

## NuqsTestingAdapter

The `withNuqsTestingAdapter{:ts}` function is a wrapper component factory function
wraps children with a `NuqsTestingAdapter{:ts}`, but you can also use
it directly:

```tsx
// [!code word:NuqsTestingAdapter]
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'

<NuqsTestingAdapter>
  <ComponentsUsingNuqs/>
</NuqsTestingAdapter>
```

It takes the same props as the arguments you can pass to `withNuqsTestingAdapter{:ts}`.

## Testing custom parsers

If you create custom parsers with `createParser{:ts}`, you will likely want to
test them.

Parsers should:

1. Define pure functions for `parse{:ts}`, `serialize{:ts}`, and `eq{:ts}`.
2. Be bijective: `parse(serialize(x)) === x{:ts}` and `serialize(parse(x)) === x{:ts}`.

To help test bijectivity, you can use helpers defined in `nuqs/testing`:

```ts
// [!code word:isParserBijective]
import {
  isParserBijective,
  testParseThenSerialize,
  testSerializeThenParse
} from 'nuqs/testing'

it('is bijective', () => {
  // Passing tests return true
  expect(isParserBijective(parseAsInteger, '42', 42)).toBe(true)
  // Failing test throws an error
  expect(() => isParserBijective(parseAsInteger, '42', 47)).toThrowError()

  // You can also test either side separately:
  expect(testParseThenSerialize(parseAsInteger, '42')).toBe(true)
  expect(testSerializeThenParse(parseAsInteger, 42)).toBe(true)
  // Those will also throw an error if the test fails,
  // which makes it easier to isolate which side failed:
  expect(() => testParseThenSerialize(parseAsInteger, 'not a number')).toThrowError()
  expect(() => testSerializeThenParse(parseAsInteger, NaN)).toThrowError()
})
```

<FeatureSupportMatrix introducedInVersion="2.4.0" hideFrameworks />

---

# Troubleshooting

URL (HTML): /docs/troubleshooting
URL (LLMs): /docs/troubleshooting.md
Source: https://raw.githubusercontent.com/47ng/nuqs/refs/heads/master/packages/docs/content/docs/troubleshooting.mdx

Common issues and solutions

<Callout title="Tip">
  Check out the list of [known issues and solutions](https://github.com/47ng/nuqs/issues/423).
</Callout>

## Pages router

Because the Next.js **pages router** is not available in an SSR context, this
hook will always return `null{:ts}` (or the default value if supplied) on SSR/SSG.

This limitation doesn’t apply to the app router.

## Caveats

### Different parsers on the same key

Hooks are synced together on a per-key basis, so if you use different parsers
on the same key, the last state update will be propagated to all other hooks
using that key. It can lead to unexpected states like this:

```ts
const [int] = useQueryState('foo', parseAsInteger)
const [float, setFloat] = useQueryState('foo', parseAsFloat)

setFloat(1.234)

// `int` is now 1.234, instead of 1
```

We recommend you abstract a key/parser pair into a dedicated hook to avoid this,
and derive any desired state from the value:

```ts
function useIntFloat() {
  const [float, setFloat] = useQueryState('foo', parseAsFloat)
  const int = Math.floor(float)
  return [{int, float}, setFloat] as const
}
```

## Client components need to be wrapped in a `<Suspense>` boundary

You may have encountered the following [error message](https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout)
from Next.js:

```
Missing Suspense boundary with useSearchParams
```

Components using hooks like `useQueryState` should be wrapped in `<Suspense>` when rendered within a page component. Adding the ‘use client’ directive to the page.tsx file is the immediate fix to get things working if you are defining components that use client-side features (like nuqs or React Hooks):

```tsx
'use client'

export default function Page() {
  return (
    <Suspense>
      <Client />
    </Suspense>
  )
}

function Client() {
  const [foo, setFoo] = useQueryState('foo')
  // ...
}
```

However, the steps below indicate the optimal approach to get better UX: separating server and client files (and moving client side code as low down the tree as possible to pre-render the outer shell).

The recommended approach is:

1. Keep page.tsx as a server component (no `'use client'{:ts}` directive)
2. Move client-side features into a separate client file.
3. Wrap the client component in a `<Suspense>` boundary.

---

# SEO

URL (HTML): /docs/seo
URL (LLMs): /docs/seo.md
Source: https://raw.githubusercontent.com/47ng/nuqs/refs/heads/master/packages/docs/content/docs/seo.mdx

Pitfalls and best practices for SEO with query strings

If your page uses query strings for local-only state, you should add a
canonical URL to your page, to tell SEO crawlers to ignore the query string
and index the page without it.

In the Next.js app router, this is done via the metadata object:

```ts
import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: '/url/path/without/querystring'
  }
}
```

If however the query string is defining what content the page is displaying
(eg: YouTube’s watch URLs, like `https://www.youtube.com/watch?v=dQw4w9WgXcQ`),
your canonical URL should contain relevant query strings, and you can still
use your parsers to read it, and to serialize the canonical URL.

```ts title="/app/watch/page.tsx"
import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from "next/navigation";
import {
  createParser,
  parseAsString,
  createLoader,
  createSerializer,
  type SearchParams,
  type UrlKeys
} from 'nuqs/server'

const youTubeVideoIdRegex = /^[^"&?\/\s]{11}$/i
const youTubeSearchParams = {
  videoId: createParser({
    parse(query) {
      if (!youTubeVideoIdRegex.test(query)) {
        return null
      }
      return query
    },
    serialize(videoId) {
      return videoId
    }
  })
}
const youTubeUrlKeys: UrlKeys<typeof youTubeSearchParams> = {
  videoId: 'v'
}
const loadYouTubeSearchParams = createLoader(
  youTubeSearchParams,
  {
    urlKeys: youTubeUrlKeys
  }
)
const serializeYouTubeSearchParams = createSerializer(
  youTubeSearchParams,
  {
    urlKeys: youTubeUrlKeys
  }
)

// --

type Props = {
  searchParams: Promise<SearchParams>
}

export async function generateMetadata({
  searchParams
}: Props): Promise<Metadata> {
  const { videoId } = await loadYouTubeSearchParams(searchParams)
  if (!videoId) {
    notFound()
  }
  return {
    alternates: {
      canonical: serializeYouTubeSearchParams('/watch', { videoId })
      // /watch?v=dQw4w9WgXcQ
    }
  }
}
```

---

# Tips and tricks

URL (HTML): /docs/tips-tricks
URL (LLMs): /docs/tips-tricks.md
Source: https://raw.githubusercontent.com/47ng/nuqs/refs/heads/master/packages/docs/content/docs/tips-tricks.mdx

A collection of good practices and tips to help you get the most out of nuqs

## Reusing hooks

If you find yourself reusing the same hooks in multiple components,
you can create a custom hook to encapsulate the parser configuration.

<Callout title="Tip">
  All query states bound to the same key will be synchronized across components.
</Callout>

```ts title="hooks/useCoordinates.ts"
'use client'

import { useQueryStates, parseAsFloat } from 'nuqs'

export function useCoordinates() {
  return useQueryStates({
    lat: parseAsFloat.withDefault(0),
    lng: parseAsFloat.withDefault(0),
  })
}
```

```tsx title="components/Map.tsx"
'use client'

import { useCoordinates } from '../hooks/useCoordinates'

function MapView() {
  const [{ lat, lng }] = useCoordinates() // Read-only
  return (
    <div>
      Latitude: {lat}
      Longitude: {lng}
    </div>
  )
}

function MapControls() {
  const [{ lat, lng }, setCoordinates] = useCoordinates()
  return (
    <div>
      <input
        type="number"
        value={lat}
        onChange={(e) => setCoordinates({ lat: e.target.valueAsNumber })}
      />
      <input
        type="number"
        value={lng}
        onChange={(e) => setCoordinates({ lng: e.target.valueAsNumber })}
      />
    </div>
  )
}
```

---

# About

URL (HTML): /docs/about
URL (LLMs): /docs/about.md
Source: https://raw.githubusercontent.com/47ng/nuqs/refs/heads/master/packages/docs/content/docs/about.mdx

About the nuqs library

## License

Released under the [MIT License](https://github.com/47ng/nuqs/blob/next/LICENSE), made with ❤️ by [François Best](https://francoisbest.com).

Using this package at work ? [Sponsor me](https://github.com/sponsors/franky47)
to help with support and maintenance.

## Contributors

<img alt="Project analytics and stats" src="https://repobeats.axiom.co/api/embed/3ee740e4729dce3992bfa8c74645cfebad8ba034.svg" />

## About the name

### How is it pronounced?

Up to you. I say “nucks” (like ducks 🦆🦆).

### What does nuqs mean?

> **Never underestimate query strings**.

Kidding aside, it’s the initials of the original name package name, `Next-UseQueryState`,
which was too long and annoying to type.

I realised after the fact that the word `nuqs` in Urdu & Arabic means “flaw” or “defect”.
It’s a good reminder that:

> Perfection is a direction, not a destination.
>
> <figcaption>
>   — 
>
>   [James Wright](https://www.youtube.com/shorts/CH_d9lVRLWk)
> </figcaption>

I probably should have checked the meaning of the word before using it,
and apologise to any Urdu/Arabic-speaking user who might find it offensive.

It’s also Klingon for “What?!”, the kind of reaction you get when you
move from `useState{:ts}` to URL state for the first time. 🖖

---

# Migration guide to v2

URL (HTML): /docs/migrations/v2
URL (LLMs): /docs/migrations/v2.md
Source: https://raw.githubusercontent.com/47ng/nuqs/refs/heads/master/packages/docs/content/docs/migrations/v2.mdx

How to update your code to use nuqs@2.0.0

Here’s a summary of the breaking changes in `nuqs@2.0.0`:

* [Enable support for other React frameworks via **adapters**](#adapters)
* [Behaviour changes](#behaviour-changes)
* [ESM-only package](#esm-only)
* [Deprecated exports have been removed](#deprecated-exports)
* [Renamed `nuqs/parsers` to `nuqs/server`](#renamed-nuqsparsers-to-nuqsserver)
* [Debug printout detection](#debug-printout-detection)
* [Dropping `next-usequerystate`](#dropping-next-usequerystate)
* [Type changes](#type-changes)

## Adapters

The biggest change is that `nuqs@2.0.0` now supports other React frameworks,
providing type-safe URL state for all.

You will need to wrap your app with the appropriate [adapter](/docs/adapters)
for your framework or router, to let the hooks know how to interact with it.

Adapters are currently available for:

* Next.js (app & pages routers)
* React SPA
* Remix
* React Router
* Testing environments (Vitest, Jest, etc.)

If you are coming from nuqs v1 (which only supported Next.js), you’ll need to
wrap your app with the appropriate `NuqsAdapter`:

### Next.js

<Callout title="Minimum required version: next@>=14.2.0" type="warn">
  Early versions of Next.js 14 were in flux with regards to shallow routing.
  Supporting those earlier versions required a lot of hacks, workarounds, and
  performance penalties, which were removed in `nuqs@2.0.0`.
</Callout>

#### App router

```tsx title="src/app/layout.tsx"
// [!code word:NuqsAdapter]
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { type ReactNode } from 'react'

export default function RootLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <html>
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  )
}
```

#### Pages router

```tsx title="src/pages/_app.tsx"
// [!code word:NuqsAdapter]
import type { AppProps } from 'next/app'
import { NuqsAdapter } from 'nuqs/adapters/next/pages'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NuqsAdapter>
      <Component {...pageProps} />
    </NuqsAdapter>
  )
}
```

#### Unified (router-agnostic)

If your Next.js app uses **both the app and pages routers** and the adapter needs
to be mounted in either, you can import the unified adapter, at the cost
of a slightly larger bundle size (\~100B).

```tsx
import { NuqsAdapter } from 'nuqs/adapters/next'
```

### Other adapters

Albeit not part of a migration from v1, you can now use nuqs in other React
frameworks via their respective [adapters](/docs/adapters).

However, there’s one more adapter that might be of interest to you, and solves
a long-standing issue with testing components using nuqs hooks:

### Testing adapter

Unit-testing components that used nuqs v1 was a hassle, as it required mocking
the Next.js router internals, causing abstraction leaks.

In v2, you can now wrap your components to test with the [`NuqsTestingAdapter`](/docs/testing),
which provides a convenient setup & assertion API for your tests.

Here’s an example with Vitest & Testing Library:

```tsx title="counter-button-example.test.tsx"
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NuqsTestingAdapter, type UrlUpdateEvent } from 'nuqs/adapters/testing'
import { describe, expect, it, vi } from 'vitest'
import { CounterButton } from './counter-button'

it('should increment the count when clicked', async () => {
  const user = userEvent.setup()
  const onUrlUpdate = vi.fn<[UrlUpdateEvent]>()
  render(<CounterButton />, {
    // Setup the test by passing initial search params / querystring:
    wrapper: ({ children }) => (
      <NuqsTestingAdapter searchParams="?count=1" onUrlUpdate={onUrlUpdate}>
        {children}
      </NuqsTestingAdapter>
    )
  })
  // Act
  const button = screen.getByRole('button')
  await user.click(button)
  // Assert changes in the state and in the (mocked) URL
  expect(button).toHaveTextContent('count is 2')
  expect(onUrlUpdate).toHaveBeenCalledOnce()
  expect(onUrlUpdate.mock.calls[0][0].queryString).toBe('?count=2')
  expect(onUrlUpdate.mock.calls[0][0].searchParams.get('count')).toBe('2')
  expect(onUrlUpdate.mock.calls[0][0].options.history).toBe('push')
})
```

## Behaviour changes

Setting the `startTransition{:ts}` option no longer sets `shallow: false{:ts}` automatically.
This is to align with other frameworks that don’t have a concept
of shallow/deep routing.

You’ll have to set both to keep sending updates to the server and getting a loading
state in Next.js:

```diff
useQueryState('q', {
  startTransition: true,
+ shallow: false
})
```

The `"use client"{:ts}` directive was not included in the client import
(`import {} from 'nuqs'{:ts}`). It has now been added, meaning that server-side code
needs to import from `nuqs/server` to avoid errors like:

```txt
Error: Attempted to call withDefault() from the server but withDefault is on
the client. It's not possible to invoke a client function from the server, it can
only be rendered as a Component or passed to props of a Client
Component.
```

## ESM only

`nuqs@2.0.0` is now an [ESM-only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)
package. This should not be much of an issue since Next.js supports ESM in
app code since version 12, but if you are bundling `nuqs` code into an
intermediate CJS library to be consumed in Next.js, you’ll run into import issues:

```txt
[ERR_REQUIRE_ESM]: require() of ES Module not supported
```

If converting your library to ESM is not possible, your main option is to
dynamically import `nuqs`:

```ts
const { useQueryState } = await import('nuqs')
```

## Deprecated exports

Some of the v1 API was marked as deprecated back in September 2023, and has been
removed in `nuqs@2.0.0`.

### `queryTypes` parsers object

The `queryTypes{:ts}` object has been removed in favor of individual parser exports,
for better tree-shaking.

Replace with `parseAsXYZ{:ts}` to match:

```diff
- import { queryTypes } from 'nuqs'
+ import { parseAsString, parseAsInteger, ... } from 'nuqs'

- useQueryState('q',    queryTypes.string.withOptions({ ... }))
- useQueryState('page', queryTypes.integer.withDefault(1))
+ useQueryState('q',    parseAsString.withOptions({ ... }))
+ useQueryState('page', parseAsInteger.withDefault(1))
```

### `subscribeToQueryUpdates`

Next.js 14.1.0 makes `useSearchParams{:ts}` reactive to shallow search params updates,
which makes this internal helper function redundant. See [#425](https://github.com/47ng/nuqs/pull/425) for context.

## Renamed `nuqs/parsers` to `nuqs/server`

When introducing the server cache in [#397](https://github.com/47ng/nuqs/pull/397), the dedicated export for parsers was
reused as it didn’t include the `"use client"{:ts}` directive. Since it now contains
more than parsers and probably will be extended with server-only code in the future,
it has been renamed to a clearer export name.

Find and replace all occurrences of `nuqs/parsers` to `nuqs/server` in your code:

```diff
- import { parseAsInteger, createSearchParamsCache } from 'nuqs/parsers'
+ import { parseAsInteger, createSearchParamsCache } from 'nuqs/server'
```

## Debug printout detection

After the rename to `nuqs`, the debugging printout detection logic handled either
`next-usequerystate` or `nuqs` being present in the `localStorage.debug{:ts}` variable.
`nuqs@2.0.0` only checks for the presence of the `nuqs` substring to enable logs.

Update your local dev environments to match by running this once in the devtools console:

```ts
if (localStorage.debug) {
  localStorage.debug = localStorage.debug.replace('next-usequerystate', 'nuqs')
}
```

## Dropping next-usequerystate

This package started under the name `next-usequerystate`, and was renamed to
`nuqs` in January 2024. The old package name was kept as an alias for the v1
release line.

`nuqs` version 2 and onwards no longer mirror to the `next-usequerystate` package name.

## Type changes

The following breaking changes only apply to exported types:

* The `Options{:ts}` type is no longer generic
* The `UseQueryStatesOptions{:ts}` is now a type rather than an interface, and is now
  generic over the type of the object you pass to `useQueryStates{:ts}`.
* [`parseAsJson{:ts}`](/docs/parsers/built-in#json) now requires a runtime
  validation function to infer the type of the parsed JSON data.
