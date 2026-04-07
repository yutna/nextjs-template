---
name: nextjs-chakra-ui
description: This skill should be used when working with Chakra UI, UI components, or the design system. Guides Chakra UI v3 and Ark UI patterns.
---

# Next.js Chakra UI

Use this skill when building UI components with Chakra UI v3 and Ark UI.

## Reference

- .claude/workflow-profile.json (stack.ui)
- src/shared/components/ (shared UI components)
- src/shared/vendor/chakra-ui/provider.tsx
- src/shared/providers/app-provider/app-provider.tsx

## Chakra UI v3 Setup

### Provider Configuration

```tsx
// src/shared/vendor/chakra-ui/provider.tsx
"use client";

import { ChakraProvider } from "@chakra-ui/react";

import { ColorModeProvider } from "./color-mode";
import { system } from "./system";

import type { ColorModeProviderProps } from "./color-mode";

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
```

For app/layout composition, reuse `src/shared/providers/app-provider/app-provider.tsx`.

### Theme Configuration

```typescript
// src/shared/vendor/chakra-ui/system.ts
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const customConfig = defineConfig({
  globalCss: {
    "html, body": {
      fontFamily: "var(--font-noto-sans-thai), sans-serif",
    },
  },
  theme: {
    tokens: {
      fonts: {
        body: { value: "var(--font-noto-sans-thai), sans-serif" },
        heading: { value: "var(--font-noto-sans-thai), sans-serif" },
        mono: { value: "var(--font-jetbrains-mono), monospace" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);
```

## Component Patterns

### Basic Component

```tsx
// src/modules/users/components/card-user/card-user.tsx
import { Box, Card, Text, Avatar, HStack, VStack } from '@chakra-ui/react';

interface UserCardProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function CardUser({ user }: UserCardProps) {
  return (
    <Card.Root>
      <Card.Body>
        <HStack gap={4}>
          <Avatar name={user.name} src={user.avatar} />
          <VStack align="start" gap={0}>
            <Text fontWeight="semibold">{user.name}</Text>
            <Text color="fg.muted" fontSize="sm">{user.email}</Text>
          </VStack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}
```

### Interactive Component (Client)

```tsx
// src/modules/users/containers/container-user-card/container-user-card.tsx
"use client";

import { Button, Card, HStack } from "@chakra-ui/react";
import { useImmer } from "use-immer";

import { CardUser } from "@/modules/users/components/card-user/card-user";

import type { ContainerUserCardProps } from "./types";

export function ContainerUserCard({
  user,
}: Readonly<ContainerUserCardProps>) {
  const [state, updateState] = useImmer({ isExpanded: false });

  return (
    <Card.Root>
      <Card.Body>
        <CardUser user={user} />
        {state.isExpanded ? <UserDetails user={user} /> : null}
      </Card.Body>
      <Card.Footer>
        <HStack>
          <Button
            onClick={() =>
              updateState((draft) => {
                draft.isExpanded = !draft.isExpanded;
              })
            }
            variant="ghost"
          >
            {state.isExpanded ? "Show Less" : "Show More"}
          </Button>
        </HStack>
      </Card.Footer>
    </Card.Root>
  );
}
```

### Form Components

```tsx
'use client';

import {
  Field,
  Input,
  Button,
  VStack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

export function UserForm({ onSubmit, isLoading }) {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack gap={4}>
        <Field.Root invalid={!!errors.name}>
          <Field.Label>Name</Field.Label>
          <Input {...register('name', { required: 'Name is required' })} />
          <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={!!errors.email}>
          <Field.Label>Email</Field.Label>
          <Input
            type="email"
            {...register('email', { required: 'Email is required' })}
          />
          <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
        </Field.Root>

        <Button type="submit" loading={isLoading} colorPalette="brand">
          Submit
        </Button>
      </VStack>
    </form>
  );
}
```

## Ark UI Integration

Ark UI provides headless components that work with Chakra UI styling:

```tsx
// src/shared/components/Combobox.tsx
'use client';

import { Combobox as ArkCombobox } from '@ark-ui/react';
import { Box, Input, List, ListItem } from '@chakra-ui/react';

interface ComboboxProps<T> {
  items: T[];
  value: T | null;
  onChange: (value: T) => void;
  itemToString: (item: T) => string;
}

export function Combobox<T>({
  items,
  value,
  onChange,
  itemToString,
}: ComboboxProps<T>) {
  return (
    <ArkCombobox.Root
      items={items}
      value={value}
      onValueChange={({ value }) => onChange(value)}
      itemToString={itemToString}
    >
      <ArkCombobox.Control>
        <ArkCombobox.Input asChild>
          <Input placeholder="Select..." />
        </ArkCombobox.Input>
        <ArkCombobox.Trigger>▼</ArkCombobox.Trigger>
      </ArkCombobox.Control>
      <ArkCombobox.Positioner>
        <ArkCombobox.Content asChild>
          <List.Root
            bg="bg.panel"
            borderRadius="md"
            boxShadow="lg"
            py={2}
          >
            {items.map((item, index) => (
              <ArkCombobox.Item key={index} item={item} asChild>
                <List.Item px={3} py={2} cursor="pointer" _hover={{ bg: 'bg.muted' }}>
                  {itemToString(item)}
                </List.Item>
              </ArkCombobox.Item>
            ))}
          </List.Root>
        </ArkCombobox.Content>
      </ArkCombobox.Positioner>
    </ArkCombobox.Root>
  );
}
```

## Layout Patterns

### Page Layout

```tsx
// src/shared/components/PageLayout.tsx
import { Box, Container, VStack } from '@chakra-ui/react';

export function PageLayout({
  header,
  children,
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box minH="100vh" bg="bg.canvas">
      {header}
      <Container maxW="container.xl" py={8}>
        <VStack gap={6} align="stretch">
          {children}
        </VStack>
      </Container>
    </Box>
  );
}
```

### Grid Layout

```tsx
import { Grid, GridItem } from '@chakra-ui/react';

export function DashboardGrid({ children }) {
  return (
    <Grid
      templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
      gap={6}
    >
      {children}
    </Grid>
  );
}
```

## Responsive Design

```tsx
import { Box, Text } from '@chakra-ui/react';

export function ResponsiveComponent() {
  return (
    <Box
      p={{ base: 4, md: 6, lg: 8 }}
      fontSize={{ base: 'sm', md: 'md' }}
      display={{ base: 'block', md: 'flex' }}
    >
      <Text>Responsive content</Text>
    </Box>
  );
}
```

## Color Mode

```tsx
import { ColorModeButton } from "@/shared/vendor/chakra-ui/color-mode";

export function ThemeControls() {
  return <ColorModeButton size="sm" variant="ghost" />;
}
```

## Do Not

- Use inline styles — use Chakra's style props
- Create custom CSS when Chakra provides the same functionality
- Mix Chakra v2 patterns with v3 — use v3 syntax only
- Skip responsive design — always consider mobile
- Use arbitrary color values — use theme tokens
