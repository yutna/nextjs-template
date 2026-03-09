# Storybook Stories

## Purpose

Story files document and visually test components in isolation using
Storybook. They live beside the component they cover and provide
interactive previews with locale switching and color mode toggling.

## Scope

Stories are **only** for presenter components:

- `src/modules/<module>/components/`
- `src/shared/components/`

Do **not** create stories for:

- screens (`screens/`)
- containers (`containers/`)
- layouts (`layouts/`)
- providers (`providers/`)
- hooks (`hooks/`)

Screens and containers are architectural layers, not visual units. Test
them with unit tests. Only presenter components get Storybook stories.

## File placement

Stories are colocated next to the component:

```text
src/modules/static-pages/components/landing-hero/
├── landing-hero.tsx
├── landing-hero.test.tsx
├── landing-hero.stories.tsx
├── index.ts
└── types.ts
```

Rules:

- Name the story file after the component: `{component-name}.stories.tsx`
- One story file per component folder
- Do not move stories into a centralized directory

## Meta object

Every story file exports a default `meta` object using `satisfies` for
type safety:

```tsx
import { ComponentName } from "./component-name";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: ComponentName,
  parameters: {
    layout: "centered",
  },
  title: "modules/<module>/components/component-name",
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;
```

Rules:

- Import `Meta` and `StoryObj` from `@storybook/nextjs-vite`
- Use `satisfies Meta<typeof Component>` — not a type annotation
- Use `import type` for Storybook types
- `title` mirrors the filesystem path for consistent sidebar navigation

## Layout parameter

- `"centered"` — small, self-contained components (buttons, cards)
- `"fullscreen"` — page-wide components (heroes, sections, screens)
- `"padded"` — default, adds padding around the component

## Story variants

### Simple component (no props or self-contained)

```tsx
export const Default: Story = {};
```

### Component with args

```tsx
export const Primary: Story = {
  args: {
    size: "lg",
    variant: "solid",
  },
};
```

### Component with custom render

```tsx
export const WithContent: Story = {
  args: {
    delay: 0,
    variant: "fadeInUp",
  },
  render: (args) => (
    <MotionReveal {...args}>
      <Box p={8}>Content</Box>
    </MotionReveal>
  ),
};
```

## Server component stories

Server components that accept a `locale` prop need special handling
because `experimentalRSC` renders them as async components. Read
the locale from Storybook's global toolbar via `StoryContext`:

```tsx
import { LandingHero } from "./landing-hero";

import type { Meta, StoryContext, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  args: {
    locale: "en",
  },
  component: LandingHero,
  parameters: {
    layout: "fullscreen",
  },
  title: "modules/static-pages/components/landing-hero",
} satisfies Meta<typeof LandingHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (_, context: StoryContext) => (
    <LandingHero locale={(context.globals["locale"] as string) || "en"} />
  ),
};
```

Key points:

- Import `StoryContext` alongside `Meta` and `StoryObj`
- Include `args: { locale: "en" }` in meta for controls panel
- Read `context.globals["locale"]` — this syncs with the toolbar
- Fallback to `"en"` when the global is not set
- The preview decorator calls `_setMockLocale()` to keep the
  `next-intl/server` mock in sync with the same toolbar value

## Locale and color mode

The global preview decorator provides:

- **Locale toolbar** — English (🇺🇸) and Thai (🇹🇭) switching
- **Color mode toolbar** — Light (☀️) and Dark (🌙) toggling

These work automatically for all stories through the `withProviders`
decorator. Server component stories must explicitly read the locale
from `context.globals` as shown above.

## Title convention

Match the filesystem path from `src/`:

- `modules/static-pages/components/landing-hero`
- `modules/static-pages/components/copy-command`
- `shared/components/error-global`
- `shared/components/not-found`

This keeps the Storybook sidebar organized by module and layer.

## What to cover

At minimum, provide a `Default` story that renders the component in
its most common state. Add named variants for:

- Visual variations (sizes, variants, color schemes)
- Interactive states (loading, error, empty, disabled)
- Edge cases (long text, missing data, boundary values)

## Import conventions

- Import the component from the local directory: `"./component-name"`
- Import Chakra UI or other libraries when building wrapper content
- Use `import type` for all Storybook type imports
- Follow the same import sorting rules as other project files

## Checklist

- [ ] Story file is colocated beside the component
- [ ] Component is in `components/` (not screens, containers, or other layers)
- [ ] Named `{component-name}.stories.tsx`
- [ ] Meta uses `satisfies Meta<typeof Component>`
- [ ] Types imported with `import type`
- [ ] `title` matches filesystem path
- [ ] Layout parameter is appropriate (`centered` / `fullscreen`)
- [ ] Server components read locale from `context.globals`
- [ ] At least a `Default` story exists
- [ ] Named variants cover meaningful visual states
