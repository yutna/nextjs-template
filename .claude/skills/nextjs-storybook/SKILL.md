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
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
};

export default config;
```

### Preview Configuration

```tsx
// .storybook/preview.tsx
import type { Preview } from '@storybook/react';
import { ChakraProvider } from '@/shared/providers/ChakraProvider';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../src/messages/en';

const preview: Preview = {
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={messages}>
        <ChakraProvider>
          <Story />
        </ChakraProvider>
      </NextIntlClientProvider>
    ),
  ],
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
// src/modules/users/components/UserCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { UserCard } from './UserCard';

const meta: Meta<typeof UserCard> = {
  title: 'Modules/Users/UserCard',
  component: UserCard,
  tags: ['autodocs'],
  argTypes: {
    user: {
      description: 'User object to display',
    },
  },
};

export default meta;
type Story = StoryObj<typeof UserCard>;

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
// src/modules/users/containers/UserFormContainer.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { UserFormContainer } from './UserFormContainer';

const meta: Meta<typeof UserFormContainer> = {
  title: 'Modules/Users/UserFormContainer',
  component: UserFormContainer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UserFormContainer>;

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
// src/shared/components/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Shared/Button',
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
    isLoading: {
      control: 'boolean',
    },
    isDisabled: {
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
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button variant="solid">Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const Loading: Story = {
  args: {
    children: 'Loading',
    isLoading: true,
  },
};
```

### Story with Mock Data

```tsx
// src/modules/users/screens/UserListScreen.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { UserListScreen } from './UserListScreen';
import { createMockUsers } from '@/test/factories';

const meta: Meta<typeof UserListScreen> = {
  title: 'Modules/Users/UserListScreen',
  component: UserListScreen,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UserListScreen>;

export const Default: Story = {
  args: {
    users: createMockUsers(5),
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
    isLoading: true,
  },
};

export const ManyUsers: Story = {
  args: {
    users: createMockUsers(50),
  },
};
```

## Story Organization

### File Structure

```
src/modules/users/
├── components/
│   ├── UserCard.tsx
│   └── UserCard.stories.tsx    # Co-located with component
├── containers/
│   ├── UserFormContainer.tsx
│   └── UserFormContainer.stories.tsx
└── screens/
    ├── UserListScreen.tsx
    └── UserListScreen.stories.tsx
```

### Naming Convention

```typescript
// Story title follows directory structure
const meta: Meta<typeof Component> = {
  title: 'Modules/[ModuleName]/[ComponentName]',
  // or
  title: 'Shared/[ComponentName]',
};
```

## Running Storybook

```bash
# Start Storybook dev server
npm run storybook

# Build static Storybook
npm run build-storybook

# Run Storybook tests
npm run test-storybook
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
