---
name: project-storybook
description: >
  Project conventions for Storybook component development. Use when writing,
  modifying, or reviewing story files (*.stories.ts, *.stories.tsx) or
  Storybook configuration in .storybook/. Covers story patterns, preview
  setup, server component mocking, locale and color mode integration,
  addon configuration, and build pipeline.
---

# Project Storybook Conventions

This skill covers the Storybook setup, story patterns, configuration,
and mocking strategy for the repository.

## Quick start

```bash
npm run dev:storybook    # Start development server on port 6006
npm run build:storybook  # Build static output for deployment
```

## Stack

- **Storybook v10** with `@storybook/nextjs-vite` framework
- **experimentalRSC: true** — async server components render directly
- **Addons:** addon-docs, addon-a11y, @chromatic-com/storybook
- **Story discovery:** `src/**/*.stories.@(js|jsx|mjs|ts|tsx)`

## Configuration files

```text
.storybook/
├── main.ts             # Framework, addons, Vite customization
├── preview.tsx         # Global decorators, toolbar, providers
├── preview-head.html   # Font preloading (Google Fonts)
├── mocks/
│   ├── server-only.ts        # Neutralizes import "server-only"
│   └── next-intl-server.ts   # Locale-aware getTranslations mock
└── vitest.setup.ts     # Portable stories test setup
```

### main.ts

Key configuration:

- **framework:** `@storybook/nextjs-vite` with absolute `nextConfigPath`
- **experimentalRSC:** `true` — required for async server component stories
- **staticDirs:** `["../public"]` — serves the public directory
- **viteFinal:** customizes Vite configuration:
  - Aliases `server-only` → empty mock
  - Aliases `next-intl/server` → locale-aware mock
  - Replaces `vite-tsconfig-paths` with explicit `projects` list to
    prevent parent directory scanning

### preview.tsx

Global decorator chain:

```text
NextIntlClientProvider → NuqsAdapter → Chakra Provider
```

The `withProviders` decorator:
1. Reads `locale` and `colorMode` from Storybook toolbar globals
2. Calls `_setMockLocale(locale)` to sync the server-side mock
3. Wraps every story in the full provider stack

Toolbar globals:
- **Color mode:** light / dark with sun / moon icons
- **Locale:** English (🇺🇸) / Thai (🇹🇭)

### preview-head.html

Preloads Google Fonts:
- **JetBrains Mono** (400–700) for code display
- **Noto Sans Thai** (100–900) for Thai language support

Sets CSS custom properties:
- `--font-jetbrains-mono`
- `--font-noto-sans-thai`

## Mocking strategy

### server-only

`import "server-only"` throws at build time in browser bundles.
The Vite alias in `main.ts` redirects it to an empty module:

```ts
// .storybook/mocks/server-only.ts
export {};
```

### next-intl/server

Server-side i18n functions (`getTranslations`, `getLocale`,
`getMessages`) are mocked with locale-aware implementations that
read from the compiled `src/messages` tree.

Key features:
- `_setMockLocale(locale)` — called by the preview decorator to
  sync with the toolbar selection
- `getTranslations({ locale?, namespace? })` — returns a translator
  function with template interpolation and `.rich()` support
- `getLocale()` — returns the current mock locale
- `getMessages()` — returns the full message tree for the current locale

The mock uses dot-notation namespace resolution to access nested
message keys, matching `next-intl`'s real behavior.

## Story patterns

### Client component (simple)

```tsx
import { CopyCommand } from "./copy-command";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: CopyCommand,
  parameters: {
    layout: "centered",
  },
  title: "modules/static-pages/components/copy-command",
} satisfies Meta<typeof CopyCommand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

### Client component (with variants)

```tsx
import { Box, Heading } from "@chakra-ui/react";

import { MotionReveal } from "./motion-reveal";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: MotionReveal,
  parameters: {
    layout: "centered",
  },
  title: "modules/static-pages/components/motion-reveal",
} satisfies Meta<typeof MotionReveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FadeInUp: Story = {
  args: {
    delay: 0,
    variant: "fadeInUp",
  },
  render: (args) => (
    <MotionReveal {...args}>
      <Box bg={{ _dark: "gray.800", base: "gray.100" }} p={8}>
        <Heading size="md">Fade In Up</Heading>
      </Box>
    </MotionReveal>
  ),
};
```

### Server component (with locale)

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

Key differences from client stories:
- Import `StoryContext` from `@storybook/nextjs-vite`
- Include `args: { locale: "en" }` in meta
- Read locale from `context.globals["locale"]` in the render function
- Always provide a fallback: `|| "en"`

## Title convention

Mirror the filesystem path from `src/`:

```text
modules/static-pages/components/landing-hero
modules/static-pages/containers/container-welcome-page
modules/static-pages/screens/screen-welcome
shared/components/error-global
```

## Layout parameter

- `"centered"` — self-contained components (buttons, cards, dialogs)
- `"fullscreen"` — page-wide components (heroes, sections, screens,
  containers)
- `"padded"` — default Storybook padding

## When to write stories

Stories are recommended for:
- All components in `components/`
- Containers that compose visual layouts
- Screens for full-page preview

Stories are not required for:
- Actions (server-only, no visual output)
- Schemas, types, utils, lib code (no visual output)
- Hooks (test with unit tests instead)

## Accessibility

The `@storybook/addon-a11y` addon runs accessibility checks on every
story automatically. Check the Accessibility panel in Storybook to
review violations and ensure components meet WCAG standards.

## Chromatic

`@chromatic-com/storybook` is installed for visual regression testing.
Each story becomes a visual snapshot that Chromatic can diff across
builds.

## Provider chain detail

The preview decorator provides this context to every story:

```text
NextIntlClientProvider
  locale: toolbar selection
  messages: src/messages[locale]
  formats: shared/config/i18n/formats
  timeZone: Asia/Bangkok
  now: new Date()
  └── NuqsAdapter (Next.js App Router adapter)
      └── Chakra Provider
          forcedTheme: toolbar colorMode selection
          └── Story
```

This matches the app's real `AppProvider` chain so components
render identically in Storybook and production.

## Troubleshooting

### `import "server-only"` error

The Vite alias in `main.ts` must redirect `server-only` to the
empty mock. Check that the alias is present in `viteFinal`.

### Translations return keys instead of values

Ensure the locale in `_setMockLocale` matches a key in
`src/messages/index.ts`. The mock reads from the compiled
message tree — if translations are missing, the raw key is
returned.

### tsconfig-paths scanning sibling projects

The `viteFinal` in `main.ts` replaces `vite-tsconfig-paths`
with an explicit `projects` list. If you see errors about
external tsconfig files, verify the replacement is filtering
all existing instances.

### Async server component not rendering

Ensure `experimentalRSC: true` is set in `main.ts` features.
Server components must be async functions.

## Checklist

- [ ] Story file colocated beside the component
- [ ] Named `{component-name}.stories.tsx`
- [ ] Meta uses `satisfies Meta<typeof Component>`
- [ ] Types imported with `import type`
- [ ] `title` matches filesystem path
- [ ] Layout parameter appropriate for the component
- [ ] Server components read locale from `context.globals`
- [ ] At least a `Default` story exists
- [ ] Color mode works (check light and dark)
- [ ] Locale switching works (check EN and TH)
- [ ] Accessibility panel shows no critical violations
