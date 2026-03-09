# Theme Settings Feature — Implementation Plan

## Overview

Build a `/settings/themes` page where users can browse ~15 design presets,
see a live preview, and save their choice persistently via `localStorage`.

## Runtime Theming Mechanism

Chakra UI v3 exposes all design tokens as CSS custom properties
(`--chakra-colors-*`, `--chakra-radii-*`, `--chakra-shadows-*`, `--chakra-fonts-*`, etc.)
totaling ~600 variables.

Each theme preset is a **"CSS variable patch"** — only the overridden variables
are stored and applied via `document.documentElement.style.setProperty()`.
This means theme switching is **instant** with **zero React re-render**.

```text
Preset selected
      ↓
useThemeSettings.setPreset(id)
      ↓
injectThemeCssVars(preset.cssVars[colorMode])  ← CSS vars on documentElement
      ↓
saveThemePreset(id, preset.cssVars)            ← persist to localStorage
```

## FOUC Prevention

To prevent a Flash of Unstyled Content on page load, an inline blocking
`<script>` is added inside `<html>` in `layout.tsx`. It reads the stored
CSS vars from `localStorage` and applies them to `document.documentElement`
**before React hydrates**.

Storage format:

```json
{
  "light": { "--chakra-colors-bg": "#ffffff", "--chakra-radii-l1": "0px" },
  "dark":  { "--chakra-colors-bg": "#000000", "--chakra-radii-l1": "0px" }
}
```

## Persistence

- **Storage:** `localStorage` only — no backend required
- **Key:** `theme-css-vars` for the CSS var overrides, `theme-preset-id` for the active preset ID
- **Scope:** per-browser, survives page reload

---

## Module Structure

```text
src/modules/theme-settings/
├── constants/
│   └── theme-presets.ts
├── types/
│   └── index.ts
├── lib/
│   ├── theme-storage/
│   │   ├── theme-storage.ts
│   │   ├── theme-storage.test.ts
│   │   └── index.ts
│   └── theme-injector/
│       ├── theme-injector.ts
│       ├── theme-injector.test.ts
│       └── index.ts
├── contexts/
│   └── theme-settings/
│       ├── theme-settings-context.ts
│       ├── index.ts
│       └── types.ts
├── providers/
│   └── theme-settings-provider/
│       ├── theme-settings-provider.tsx
│       ├── index.ts
│       └── types.ts
├── hooks/
│   └── use-theme-settings/
│       ├── use-theme-settings.ts
│       ├── use-theme-settings.test.ts
│       ├── index.ts
│       └── types.ts
├── components/
│   ├── card-theme-preset/
│   │   ├── card-theme-preset.tsx
│   │   ├── card-theme-preset.stories.tsx
│   │   ├── card-theme-preset.test.tsx
│   │   ├── index.ts
│   │   └── types.ts
│   └── preview-theme/
│       ├── preview-theme.tsx
│       ├── preview-theme.stories.tsx
│       ├── preview-theme.test.tsx
│       ├── index.ts
│       └── types.ts
├── containers/
│   └── container-theme-settings/
│       ├── container-theme-settings.tsx
│       ├── container-theme-settings.test.tsx
│       ├── index.ts
│       └── types.ts
└── screens/
    └── screen-theme-settings/
        ├── screen-theme-settings.tsx
        ├── screen-theme-settings.test.tsx
        ├── index.ts
        └── types.ts
```

---

## Types (`src/modules/theme-settings/types/index.ts`)

```ts
export type ThemePresetId =
  | "default"
  | "minimalism"
  | "flat-design"
  | "dark-oled"
  | "accessible"
  | "swiss-modernism"
  | "retro-futurism"
  | "cyberpunk"
  | "vaporwave"
  | "y2k"
  | "memphis"
  | "neubrutalism"
  | "brutalism"
  | "pixel-art"
  | "exaggerated-minimal";

export interface ThemePresetCssVars {
  light: Record<string, string>;
  dark: Record<string, string>;
}

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  description: string;
  /** 3–5 hex colors shown as swatches in the preset card thumbnail */
  swatches: string[];
  cssVars: ThemePresetCssVars;
}
```

---

## 15 Theme Presets

Each preset only specifies the CSS variables that differ from Chakra defaults.

### Key CSS variables to override

| Variable Group | Chakra CSS Var Examples |
| -------------- | ----------------------- |
| Background | `--chakra-colors-bg`, `--chakra-colors-bg-subtle`, `--chakra-colors-bg-muted`, `--chakra-colors-bg-panel` |
| Foreground | `--chakra-colors-fg`, `--chakra-colors-fg-muted`, `--chakra-colors-fg-subtle` |
| Border | `--chakra-colors-border`, `--chakra-colors-border-muted` |
| Color palette | `--chakra-colors-<palette>-solid`, `--chakra-colors-<palette>-fg`, `--chakra-colors-<palette>-subtle` |
| Border radius | `--chakra-radii-l1` (sm), `--chakra-radii-l2` (md), `--chakra-radii-l3` (lg), `--chakra-radii-full` |
| Shadows | `--chakra-shadows-xs`, `--chakra-shadows-sm`, `--chakra-shadows-md`, `--chakra-shadows-lg`, `--chakra-shadows-xl` |
| Typography | `--chakra-fonts-heading`, `--chakra-fonts-body`, `--chakra-fonts-mono` |

### Preset Definitions

| # | ID | Name | Light Mode Key Changes | Dark Mode Key Changes |
| - | -- | ---- | ---------------------- | --------------------- |
| 1 | `default` | Default | *(no overrides — Chakra defaults)* | *(no overrides)* |
| 2 | `minimalism` | Minimalism / Swiss Style | radii=0px, zero shadows, gray-only palette | same radii/shadows, dark neutrals |
| 3 | `flat-design` | Flat Design | radii=4px, vivid blue accent, zero shadows | same structure, dark bg |
| 4 | `dark-oled` | Dark Mode OLED | bg=#ffffff, fg=#000000 | bg=#000000, fg=#ffffff, pure black surface |
| 5 | `accessible` | Accessible & Ethical | highest-contrast black/white, radii=8px, +font-size hint | same pattern dark |
| 6 | `swiss-modernism` | Swiss Modernism 2.0 | radii=0px, black/white/red #E3000F, mono font | dark bg, red accent stays |
| 7 | `retro-futurism` | Retro-Futurism | radii=0px, neon teal/cyan on near-black, mono font | near-black bg, brighter neon |
| 8 | `cyberpunk` | Cyberpunk UI | radii=0px, neon pink/purple on dark, mono font | pure dark bg, higher neon saturation |
| 9 | `vaporwave` | Vaporwave | radii=12px, pink `#FF6EB4` + purple `#BD93F9`, soft bg | dark purple bg, pink fg |
| 10 | `y2k` | Y2K Aesthetic | radii=16px, chrome blue `#0080FF`, metallic tones | dark with chrome highlights |
| 11 | `memphis` | Memphis Design | radii=0px, bold primary `#FF4500` accent, strong contrast | dark bg, same bold palette |
| 12 | `neubrutalism` | Neubrutalism | radii=0px, `4px 4px 0 #000` offset shadows, thick borders | same shadows on dark bg |
| 13 | `brutalism` | Brutalism | radii=0px, zero shadows, maximum #000/#fff contrast | inverse: pure white bg → pure black |
| 14 | `pixel-art` | Pixel Art | radii=0px, `image-rendering:pixelated` hint, high-contrast | dark bg, bright pixel palette |
| 15 | `exaggerated-minimal` | Exaggerated Minimalism | radii=9999px (full), single accent color, near-zero surface decoration | same radii, dark bg |

---

## Layer Implementations

### `lib/theme-storage`

**Responsibilities:** read/write CSS var overrides + active preset ID from/to `localStorage`.

```ts
// Public API
saveThemeCssVars(vars: ThemePresetCssVars): void
loadThemeCssVars(): ThemePresetCssVars | null
clearThemeCssVars(): void

saveThemePresetId(id: ThemePresetId): void
loadThemePresetId(): ThemePresetId | null
```

### `lib/theme-injector`

**Responsibilities:** apply/clear CSS variable overrides on `document.documentElement`.

```ts
// Public API
injectThemeCssVars(vars: Record<string, string>): void
clearThemeCssVars(keys: string[]): void
```

### `contexts/theme-settings`

```ts
interface ThemeSettingsContextValue {
  activePresetId: ThemePresetId;
  setPreset: (preset: ThemePreset) => void;
  resetToDefault: () => void;
}
```

### `providers/theme-settings-provider`

- `"use client"`
- On mount (`useEffect`): reads `loadThemePresetId()` + `loadThemeCssVars()`, calls `injectThemeCssVars()`
- Provides `ThemeSettingsContext` to children
- Must be placed **above** `ChakraProvider` in the provider tree so CSS vars are set
  before Chakra renders

### `hooks/use-theme-settings`

```ts
interface UseThemeSettingsReturn {
  activePresetId: ThemePresetId;
  handleSelectPreset: (preset: ThemePreset) => void;  // preview-only, not saved
  handleSavePreset: () => void;                        // persist to localStorage
  handleResetToDefault: () => void;
}
```

---

## Components

### `card-theme-preset`

- Displays: color swatches (3–5 circles), preset name, short description
- Props: `preset: ThemePreset`, `isActive: boolean`, `onClickSelect: (preset: ThemePreset) => void`
- Visual state: ring/border when `isActive`

### `preview-theme`

A static preview panel rendering real Chakra components so users see how the
active theme looks. Contains:

- Typography: `Heading` (h1–h3), `Text` (body, muted)
- Form: `Input`, `Button` (solid, outline, ghost variants), `Badge`
- Feedback: `Alert` (info), `Avatar` group
- Layout: `Card` with content
- Uses `useColorMode` internally (no prop) — it reacts to the current color mode

---

## Container: `container-theme-settings`

`"use client"` — orchestrates the page.

```tsx
export function ContainerThemeSettings() {
  const { activePresetId, handleSelectPreset, handleSavePreset, handleResetToDefault } =
    useThemeSettings();

  return (
    <Grid templateColumns={{ base: "1fr", md: "auto 1fr" }}>
      <Box>
        {THEME_PRESETS.map((preset) => (
          <CardThemePreset
            key={preset.id}
            preset={preset}
            isActive={preset.id === activePresetId}
            onClickSelect={handleSelectPreset}
          />
        ))}
      </Box>
      <Box>
        <PreviewTheme />
        <Button onClick={handleSavePreset}>Save & Apply</Button>
        <Button onClick={handleResetToDefault} variant="outline">Reset to Default</Button>
      </Box>
    </Grid>
  );
}
```

---

## Screen: `screen-theme-settings`

Server component. Composes `ContainerThemeSettings`.

```tsx
import "server-only";
// ...
export async function ScreenThemeSettings({ locale }: Readonly<ScreenThemeSettingsProps>) {
  return (
    <Container maxW="6xl" py={8}>
      <Heading mb={6}>{t("heading")}</Heading>
      <ContainerThemeSettings />
    </Container>
  );
}
```

---

## App Route

**File:** `src/app/[locale]/(public)/settings/themes/page.tsx`

```tsx
import "server-only";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { ScreenThemeSettings } from "@/modules/theme-settings/screens/screen-theme-settings";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function Page({ params }: Readonly<PageProps>) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <ScreenThemeSettings locale={locale} />;
}
```

---

## Route Helper

**New file:** `src/shared/routes/public/settings-themes/index.ts`

```ts
export const settingsThemes = {
  path: () => "/settings/themes",
};
```

Update `src/shared/routes/public/index.ts`:

```ts
import { settingsThemes } from "./settings-themes";

export const publicRoutes = {
  settingsThemes,
};
```

Update `src/shared/routes/index.ts`:

```ts
import { root } from "./root";
import { publicRoutes } from "./public";

export const routes = {
  root,
  public: publicRoutes,
};
```

---

## AppProvider Integration

**File:** `src/shared/providers/app-provider/app-provider.tsx`

Add `ThemeSettingsProvider` **above** `<Provider>` (ChakraProvider):

```tsx
<NextIntlClientProvider ...>
  <NuqsAdapter>
    <ThemeSettingsProvider>   {/* ← add this */}
      <Provider>
        {children}
        <Toaster />
      </Provider>
    </ThemeSettingsProvider>
  </NuqsAdapter>
</NextIntlClientProvider>
```

---

## FOUC Prevention Script

**File:** `src/app/[locale]/layout.tsx` — add inside `<html>` before `<body>`:

```tsx
<html lang={locale} suppressHydrationWarning ...>
  <script
    dangerouslySetInnerHTML={{
      __html: `
        try {
          var raw = localStorage.getItem('theme-css-vars');
          if (raw) {
            var allVars = JSON.parse(raw);
            var isDark = document.documentElement.classList.contains('dark');
            var vars = isDark ? allVars.dark : allVars.light;
            if (vars) {
              Object.keys(vars).forEach(function(k) {
                document.documentElement.style.setProperty(k, vars[k]);
              });
            }
          }
        } catch(e) {}
      `,
    }}
  />
  <body>...</body>
</html>
```

> Note: `eslint-disable-next-line project/no-inline-style` is NOT needed here
> because this is a `<script>` tag, not JSX `style={}` prop.
> However, `dangerouslySetInnerHTML` on `<script>` in `<html>` (outside `<body>`)
> requires placing it after `<html>` opening but before `<body>`. Next.js supports this.

---

## i18n Messages

### English (`src/messages/en/modules/theme-settings/`)

**`screen.json`**

```json
{
  "heading": "Theme Settings",
  "subheading": "Choose a design preset that matches your style"
}
```

**`actions.json`**

```json
{
  "save": "Save & Apply Theme",
  "reset": "Reset to Default"
}
```

**Aggregation** `src/messages/en/modules/theme-settings/index.ts`:

```ts
import actions from "./actions.json";
import screen from "./screen.json";

export const themeSettings = { actions, screen };
```

Mirror the exact same file structure in `src/messages/th/modules/theme-settings/`
with Thai translations.

Update `src/messages/en/modules/index.ts` and `src/messages/th/modules/index.ts`:

```ts
import { themeSettings } from "./theme-settings";
export const modules = { staticPages, themeSettings };
```

---

## Build Order (with dependencies)

```text
Step 1:  types                      (no deps)
Step 2:  constants                  (depends on: types)
Step 3:  lib/theme-storage          (depends on: types)
Step 4:  lib/theme-injector         (depends on: types)
Step 5:  contexts/theme-settings    (depends on: types)
Step 6:  providers/theme-settings-provider  (depends on: context, lib-storage, lib-injector)
Step 7:  hooks/use-theme-settings   (depends on: context)
Step 8:  components/card-theme-preset  (depends on: types)
Step 9:  components/preview-theme      (depends on: types)
Step 10: containers/container-theme-settings  (depends on: hook, comp-card, comp-preview, constants)
Step 11: screens/screen-theme-settings  (depends on: container)
Step 12: app route page.tsx          (depends on: screen, route-helper)
Step 13: route-helper                (no deps)
Step 14: i18n messages               (no deps)
Step 15: AppProvider integration     (depends on: provider)
Step 16: layout.tsx FOUC script      (depends on: lib-storage storage key constants)
```

---

## Checklist

- [ ] `types/index.ts` — `ThemePresetId`, `ThemePreset`, `ThemePresetCssVars`
- [ ] `constants/theme-presets.ts` — 15 presets with `cssVars.light` + `cssVars.dark`
- [ ] `lib/theme-storage` — save/load CSS vars + preset ID to/from localStorage
- [ ] `lib/theme-injector` — apply/clear CSS vars on `document.documentElement`
- [ ] `contexts/theme-settings` — `ThemeSettingsContext` with typed value
- [ ] `providers/theme-settings-provider` — `"use client"`, reads storage, injects on mount
- [ ] `hooks/use-theme-settings` — returns `activePresetId`, `handleSelectPreset`, `handleSavePreset`, `handleResetToDefault`
- [ ] `components/card-theme-preset` — swatch thumbnail card + story + test
- [ ] `components/preview-theme` — live sample UI panel + story + test
- [ ] `containers/container-theme-settings` — `"use client"`, binds hook + components + test
- [ ] `screens/screen-theme-settings` — server component + test
- [ ] `app/[locale]/(public)/settings/themes/page.tsx` — thin route entry
- [ ] `shared/routes/public/settings-themes` — `routes.public.settingsThemes.path()`
- [ ] i18n — `en/` + `th/` messages for heading, subheading, save, reset
- [ ] `AppProvider` — wrap with `ThemeSettingsProvider`
- [ ] `layout.tsx` — add FOUC prevention `<script>` before `<body>`
- [ ] All tests pass (`npm run test`)
- [ ] All lint passes (`npm run lint`)
- [ ] All types pass (`npm run check-types`)
- [ ] QA verified in browser (light mode + dark mode, theme switch, page reload persists theme)
