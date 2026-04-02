---
name: nextjs-state-machines
description: This skill should be used when working with state machines, XState, or Zag.js. Guides XState and Zag.js integration patterns.
---

# Next.js State Machines

Use this skill when implementing complex state management with XState or UI primitives with Zag.js.

## Reference

- .claude/workflow-profile.json (stack.state)

## When to Use What

| Tool | Use Case |
|------|----------|
| XState | Complex business logic, multi-step flows, workflows |
| Zag.js | UI component state (modals, menus, accordions) |
| nuqs | URL state management |
| immer | Immutable state updates |

## XState Integration

### Creating a Machine

```typescript
// src/modules/checkout/lib/checkoutMachine.ts
import { createMachine, assign } from 'xstate';

interface CheckoutContext {
  cart: CartItem[];
  shipping: ShippingInfo | null;
  payment: PaymentInfo | null;
  error: string | null;
}

type CheckoutEvent =
  | { type: 'SET_SHIPPING'; data: ShippingInfo }
  | { type: 'SET_PAYMENT'; data: PaymentInfo }
  | { type: 'SUBMIT' }
  | { type: 'BACK' }
  | { type: 'RETRY' };

export const checkoutMachine = createMachine({
  id: 'checkout',
  initial: 'cart',
  context: {
    cart: [],
    shipping: null,
    payment: null,
    error: null,
  } as CheckoutContext,
  states: {
    cart: {
      on: {
        SET_SHIPPING: {
          target: 'shipping',
          actions: assign({
            shipping: (_, event) => event.data,
          }),
        },
      },
    },
    shipping: {
      on: {
        SET_PAYMENT: {
          target: 'payment',
          actions: assign({
            payment: (_, event) => event.data,
          }),
        },
        BACK: 'cart',
      },
    },
    payment: {
      on: {
        SUBMIT: 'processing',
        BACK: 'shipping',
      },
    },
    processing: {
      invoke: {
        src: 'processPayment',
        onDone: 'success',
        onError: {
          target: 'error',
          actions: assign({
            error: (_, event) => event.data.message,
          }),
        },
      },
    },
    success: {
      type: 'final',
    },
    error: {
      on: {
        RETRY: 'payment',
      },
    },
  },
});
```

### Using in React

```tsx
// src/modules/checkout/containers/CheckoutContainer.tsx
'use client';

import { useMachine } from '@xstate/react';
import { checkoutMachine } from '../lib/checkoutMachine';
import { CartStep } from '../components/CartStep';
import { ShippingStep } from '../components/ShippingStep';
import { PaymentStep } from '../components/PaymentStep';

export function CheckoutContainer({ initialCart }) {
  const [state, send] = useMachine(checkoutMachine, {
    context: { cart: initialCart },
    services: {
      processPayment: async (context) => {
        return processPaymentAction({
          cart: context.cart,
          shipping: context.shipping,
          payment: context.payment,
        });
      },
    },
  });

  return (
    <div>
      {state.matches('cart') && (
        <CartStep
          cart={state.context.cart}
          onNext={(shipping) => send({ type: 'SET_SHIPPING', data: shipping })}
        />
      )}
      {state.matches('shipping') && (
        <ShippingStep
          onNext={(payment) => send({ type: 'SET_PAYMENT', data: payment })}
          onBack={() => send({ type: 'BACK' })}
        />
      )}
      {state.matches('payment') && (
        <PaymentStep
          onSubmit={() => send({ type: 'SUBMIT' })}
          onBack={() => send({ type: 'BACK' })}
        />
      )}
      {state.matches('processing') && <ProcessingSpinner />}
      {state.matches('success') && <SuccessMessage />}
      {state.matches('error') && (
        <ErrorMessage
          message={state.context.error}
          onRetry={() => send({ type: 'RETRY' })}
        />
      )}
    </div>
  );
}
```

## Zag.js Integration

### Using Zag.js with React

```tsx
// src/shared/components/Dialog.tsx
'use client';

import * as dialog from '@zag-js/dialog';
import { useMachine, normalizeProps } from '@zag-js/react';
import { useId } from 'react';

interface DialogProps {
  trigger: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

export function Dialog({ trigger, title, children }: DialogProps) {
  const [state, send] = useMachine(dialog.machine({ id: useId() }));
  const api = dialog.connect(state, send, normalizeProps);

  return (
    <>
      <button {...api.getTriggerProps()}>{trigger}</button>
      {api.open && (
        <div {...api.getBackdropProps()} />
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <h2 {...api.getTitleProps()}>{title}</h2>
            <button {...api.getCloseTriggerProps()}>Close</button>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
```

### Common Zag.js Patterns

```tsx
// Accordion
import * as accordion from '@zag-js/accordion';

// Menu
import * as menu from '@zag-js/menu';

// Tabs
import * as tabs from '@zag-js/tabs';

// Tooltip
import * as tooltip from '@zag-js/tooltip';
```

## nuqs for URL State

### Basic Usage

```tsx
// src/modules/products/hooks/useProductFilters.ts
'use client';

import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';

export function useProductFilters() {
  const [search, setSearch] = useQueryState('q', parseAsString);
  const [category, setCategory] = useQueryState('category', parseAsString);
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [sort, setSort] = useQueryState('sort', parseAsString.withDefault('newest'));

  return {
    filters: { search, category, page, sort },
    setSearch,
    setCategory,
    setPage,
    setSort,
  };
}
```

### With Multiple Values

```tsx
import { useQueryStates, parseAsArrayOf, parseAsString } from 'nuqs';

export function useMultiFilters() {
  return useQueryStates({
    tags: parseAsArrayOf(parseAsString).withDefault([]),
    priceRange: parseAsArrayOf(parseAsInteger).withDefault([0, 1000]),
  });
}
```

## Immer for Immutable Updates

```tsx
'use client';

import { useImmer } from 'use-immer';

interface FormState {
  user: {
    name: string;
    addresses: Address[];
  };
}

export function ComplexForm() {
  const [state, updateState] = useImmer<FormState>({
    user: { name: '', addresses: [] },
  });

  const addAddress = () => {
    updateState((draft) => {
      draft.user.addresses.push({ street: '', city: '' });
    });
  };

  const updateAddress = (index: number, field: string, value: string) => {
    updateState((draft) => {
      draft.user.addresses[index][field] = value;
    });
  };

  return (
    <form>
      <input
        value={state.user.name}
        onChange={(e) =>
          updateState((draft) => {
            draft.user.name = e.target.value;
          })
        }
      />
      {state.user.addresses.map((addr, i) => (
        <AddressInput
          key={i}
          address={addr}
          onChange={(field, value) => updateAddress(i, field, value)}
        />
      ))}
      <button type="button" onClick={addAddress}>
        Add Address
      </button>
    </form>
  );
}
```

## Do Not

- Use XState for simple boolean toggles — use useState instead
- Mix state management approaches inconsistently
- Skip TypeScript types for machine context and events
- Use Zag.js when Chakra UI already provides the component
