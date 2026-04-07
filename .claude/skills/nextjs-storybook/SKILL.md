---
name: nextjs-storybook
description: This skill should be used when working with Storybook, stories, or component documentation. Guides Storybook integration patterns.
---

# Next.js Storybook

Use this skill when creating or maintaining Storybook stories for component documentation.

## Reference

- .storybook/ (Storybook configuration)
- src/modules/*/components/ (component locations)

## Storybook Setup

### Configuration

```typescript
// .storybook/main.ts
import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@chromatic-com/storybook",
  ],
  features: {
    experimentalRSC: true,
  },
  framework: {
    name: "@storybook/nextjs-vite",
    options: {
      nextConfigPath: "../next.config.ts",
    },
  },
  staticDirs: ["../public"],
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
};

export default config;
```

### Preview Configuration

```tsx
// .storybook/preview.tsx
import { NextIntlClientProvider } from "next-intl";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { messages } from "../src/messages";
import { formats } from "../src/shared/config/i18n/formats";
import { TIME_ZONE } from "../src/shared/constants/timezone";
import { Provider } from "../src/shared/vendor/chakra-ui/provider";

import type { Preview } from "@storybook/nextjs-vite";

const preview: Preview = {
  decorators: [
    (Story, context) => (
      <NextIntlClientProvider
        formats={formats}
        locale="en"
        messages={messages.en}
        now={new Date()}
        timeZone={TIME_ZONE}
      >
        <NuqsAdapter>
          <Provider forcedTheme={context.globals["colorMode"] as "dark" | "light"}>
            <Story />
          </Provider>
        </NuqsAdapter>
      </NextIntlClientProvider>
    ),
  ],
  globalTypes: {
    colorMode: {
      toolbar: {
        items: ["light", "dark"],
        title: "Color Mode",
      },
    },
  },
  initialGlobals: {
    colorMode: "light",
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
```

## Writing Stories

### Basic Story

```tsx
// src/modules/users/components/card-user/card-user.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CardUser } from './card-user';

const meta = {
  title: 'modules/users/components/user-card',
  component: CardUser,
  tags: ['autodocs'],
  argTypes: {
    user: {
      description: 'User object to display',
    },
  },
} satisfies Meta<typeof CardUser>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://i.pravatar.cc/150?u=john',
    },
  },
};

export const WithoutAvatar: Story = {
  args: {
    user: {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
  },
};

export const LongName: Story = {
  args: {
    user: {
      id: '3',
      name: 'Alexander Bartholomew Christopher Davidson III',
      email: 'alexander@example.com',
    },
  },
};
```

### Interactive Story

```tsx
// src/modules/users/containers/container-user-form/container-user-form.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { within, userEvent, expect } from '@storybook/test';
import { ContainerUserForm } from './container-user-form';

const meta: Meta<typeof ContainerUserForm> = {
  title: 'modules/users/containers/user-form-container',
  component: ContainerUserForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ContainerUserForm>;

export const Default: Story = {};

export const FilledForm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      canvas.getByLabelText(/name/i),
      'John Doe'
    );
    await userEvent.type(
      canvas.getByLabelText(/email/i),
      'john@example.com'
    );
  },
};

export const WithValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Submit empty form to trigger validation
    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));

    // Verify error messages appear
    await expect(canvas.getByText(/name is required/i)).toBeInTheDocument();
  },
};
```

### Story with Controls

```tsx
// src/shared/components/button/button.stories.tsx
import { HStack } from "@chakra-ui/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'shared/components/button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost'],
    },
    colorPalette: {
      control: 'select',
      options: ['brand', 'gray', 'red', 'green'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Variants: Story = {
  render: () => (
    <HStack gap="2">
      <Button variant="solid">Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </HStack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <HStack align="center" gap="2">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </HStack>
  ),
};

export const Loading: Story = {
  args: {
    children: 'Loading',
    loading: true,
  },
};
```

### Story with Mock Data

```tsx
// src/modules/users/screens/screen-user-list/screen-user-list.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ScreenUserList } from './screen-user-list';

const sampleUsers = [
  { email: "john@example.com", id: "user-1", name: "John Doe" },
  { email: "jane@example.com", id: "user-2", name: "Jane Smith" },
];

const meta: Meta<typeof ScreenUserList> = {
  title: 'modules/users/screens/user-list-screen',
  component: ScreenUserList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ScreenUserList>;

export const Default: Story = {
  args: {
    users: sampleUsers,
  },
};

export const Empty: Story = {
  args: {
    users: [],
  },
};

export const Loading: Story = {
  args: {
    users: undefined,
    loading: true,
  },
};

export const ManyUsers: Story = {
  args: {
    users: [...sampleUsers, ...sampleUsers, ...sampleUsers],
  },
};
```

## Story Organization

### File Structure

```
src/modules/users/
├── components/
│   └── user-card/
│       ├── user-card.tsx
│       └── user-card.stories.tsx
├── containers/
│   └── user-form-container/
│       ├── user-form-container.tsx
│       └── user-form-container.stories.tsx
└── screens/
    └── user-list-screen/
        ├── user-list-screen.tsx
        └── user-list-screen.stories.tsx
```

### Naming Convention

```typescript
// Story title follows the repo path shape
const meta = {
  title: "modules/[module-name]/components/[component-name]",
  // or
  title: "shared/components/[component-name]",
} satisfies Meta<typeof Component>;
```

## Running Storybook

```bash
# Start Storybook dev server
npm run dev:storybook

# Build static Storybook
npm run build:storybook

# Run the Storybook smoke test project
npm run test -- src/test/stories-smoke.test.tsx
```

## Best Practices

### 1. Document All States

```tsx
export const Default: Story = {};
export const Loading: Story = {};
export const Empty: Story = {};
export const Error: Story = {};
export const Disabled: Story = {};
```

### 2. Use Realistic Data

```tsx
// Good - realistic data
args: {
  user: {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
  },
}

// Bad - placeholder data
args: {
  user: {
    name: 'Test',
    email: 'test@test.com',
  },
}
```

### 3. Test Interactions

```tsx
export const FormSubmission: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/email/i), 'test@example.com');
    await userEvent.click(canvas.getByRole('button'));
    await expect(canvas.getByText(/success/i)).toBeInTheDocument();
  },
};
```

## Do Not

- Skip stories for complex components
- Use unrealistic mock data
- Forget to test edge cases (empty, loading, error)
- Create stories without proper typing
- Ignore accessibility testing in stories
