---
name: zag-js
description: >
  Zag.js UI component state machines for React. Use when building
  custom headless components directly with Zag.js state machines,
  typically when Ark UI or Chakra UI do not cover the use case.
  Covers machine setup, anatomy, event handling, prop normalization,
  and the service-based API pattern (v1.35.3+).
metadata:
  version: "1.35.3"
  source: https://zagjs.com/llms-react.txt
---

# Zag.js for React

Zag.js provides framework-agnostic UI component state machines.
In React, connect a machine to your component using `useMachine`
from `@zag-js/react`, then spread `api` props onto DOM elements
via `api.getRootProps()`, `api.getTriggerProps()`,
`api.getContentProps()`, etc.

## When to use Zag.js directly

- Chakra UI and Ark UI do not have the component you need
- You need full control over the state machine internals
- You need to compose multiple machines together

**Prefer Ark UI (headless) or Chakra UI (styled) over raw Zag.js
when possible.**

## Quick pattern (v1.35.3)

```tsx
import * as accordion from "@zag-js/accordion"
import { useMachine, normalizeProps } from "@zag-js/react"
import { useId } from "react"

const data = [
  { title: "Watercraft", content: "Sample content" },
  { title: "Automobiles", content: "Sample content" },
]

function Accordion() {
  const service = useMachine(accordion.machine, { id: useId() })
  const api = accordion.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      {data.map((item) => (
        <div
          key={item.title}
          {...api.getItemProps({ value: item.title })}
        >
          <h3>
            <button
              {...api.getItemTriggerProps({ value: item.title })}
            >
              {item.title}
            </button>
          </h3>
          <div
            {...api.getItemContentProps({ value: item.title })}
          >
            {item.content}
          </div>
        </div>
      ))}
    </div>
  )
}
```

## Key concepts

- **`machine`** — each `@zag-js/*` package exports a `machine`
  object (not a function call)
- **`useMachine(machine, context)`** — creates a service instance;
  pass machine as first arg and context object (with `id`) as
  second arg
- **`connect(service, normalizeProps)`** — returns the `api` object
  with all prop getters
- **`normalizeProps`** — from `@zag-js/react`, converts machine
  props to React-compatible props
- **`useId()`** — always pass a stable `id` to the machine to
  avoid SSR mismatch
- **`splitProps(props)`** — each package exports `splitProps` to
  separate machine props from component-local props

## Creating a reusable component

Use `splitProps` to build abstracted components:

```tsx
import * as accordion from "@zag-js/accordion"
import { useMachine, normalizeProps } from "@zag-js/react"
import { useId } from "react"

interface Item {
  value: string
  title: React.ReactNode
  content: React.ReactNode
}

interface AccordionProps extends Omit<accordion.Props, "id"> {
  items: Item[]
}

function Accordion(props: AccordionProps) {
  const [machineProps, localProps] = accordion.splitProps(props)

  const service = useMachine(accordion.machine, {
    id: useId(),
    ...machineProps,
  })

  const api = accordion.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      {localProps.items.map((item) => (
        <div {...api.getItemProps({ value: item.value })}>
          <h3>
            <button
              {...api.getItemTriggerProps({ value: item.value })}
            >
              {item.title}
            </button>
          </h3>
          <div
            {...api.getItemContentProps({ value: item.value })}
          >
            {item.content}
          </div>
        </div>
      ))}
    </div>
  )
}
```

## Controlled pattern

Use `value` and `onValueChange` for external state control:

```tsx
import { useState } from "react"

function ControlledAccordion() {
  const [value, setValue] = useState(["home"])

  const service = useMachine(accordion.machine, {
    value,
    onValueChange(details) {
      setValue(details.value)
    },
  })

  // ...
}
```

## API reference

Full component API (anatomy, props, events, data attributes) for
all Zag.js machines with React bindings:

→ [references/llms-react.md](references/llms-react.md)
