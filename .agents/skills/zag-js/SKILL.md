---
name: zag-js
description: Zag.js UI component state machines for React. Use when building custom headless components directly with Zag.js state machines — e.g. when Ark UI/Chakra UI don't cover the use case. Covers machine setup, anatomy, event handling, and prop normalization.
metadata:
  version: "1.35.3"
  source: https://zagjs.com/llms-react.txt
---

Zag.js provides framework-agnostic UI component state machines. In React, you connect a machine to your component using `useMachine` from `@zag-js/react`, then spread `api` props onto DOM elements via `api.getTriggerProps()`, `api.getContentProps()`, etc.

**When to use Zag.js directly:**

- Chakra UI and Ark UI don't have the component you need
- You need full control over the state machine internals
- You need to compose multiple machines together

**Prefer Ark UI (headless) or Chakra UI (styled) over raw Zag.js when possible.**

## API Reference

Full component API (anatomy, props, events, data attributes) for all Zag.js machines with React bindings:

→ [references/llms-react.md](references/llms-react.md)

## Quick Pattern

```tsx
import * as accordion from "@zag-js/accordion";
import { useMachine, normalizeProps } from "@zag-js/react";
import { useId } from "react";

export function Accordion() {
  const [state, send] = useMachine(accordion.machine({ id: useId() }));
  const api = accordion.connect(state, send, normalizeProps);

  return (
    <div {...api.getRootProps()}>
      {items.map((item) => (
        <div key={item.value} {...api.getItemProps({ value: item.value })}>
          <button {...api.getItemTriggerProps({ value: item.value })}>
            {item.label}
          </button>
          <div {...api.getItemContentProps({ value: item.value })}>
            {item.content}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Key Concepts

- **`machine(ctx)`** — creates a machine instance with initial context
- **`connect(state, send, normalizeProps)`** — returns the `api` object with all prop getters
- **`normalizeProps`** — from `@zag-js/react`, converts machine props to React-compatible props
- **`useId()`** — always pass a stable `id` to the machine to avoid SSR mismatch
- Machine context is reactive — update via `api.setContext({ ... })`
