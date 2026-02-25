# Chakra UI Theme Settings Page

A runtime theme customisation system with a dedicated settings UI. Users can change brand colors, font scale, border radius, and spacing — with changes persisting via `localStorage` and taking effect instantly without a page reload.

## Core Approach: CSS Variable Injection

Chakra UI v3 compiles every design token into a CSS custom property on `:root` at build time, for example:

```css
:root {
  --chakra-colors-teal-500: #319795;
  --chakra-font-sizes-md: 1rem;
  --chakra-radii-md: 0.375rem;
}
```

Because all Chakra component styles reference these CSS variables (not hardcoded values), we can **override them at runtime** via `document.documentElement.style.setProperty(...)` without rebuilding the Chakra `system` object or re-mounting any provider.

### Architecture

```text
ThemeSettingsProvider   (React context + localStorage persistence)
  └── ThemeCssInjector  (useEffect → sets CSS vars on documentElement)
        └── AppProvider (existing Chakra ChakraProvider — unchanged)
```

The `system` object in `src/shared/vendor/chakra-ui/system.ts` requires one addition: a `brand` color palette with token values that reference runtime CSS variables. Everything else (font scale, spacing, radii) works by directly overriding the CSS variables Chakra already generates.

## Customisable Properties

| Property | Tokens affected | Storage key |
| --- | --- | --- |
| Brand color | `--chakra-colors-brand-{50..950}` | `theme.brandColor` |
| Font size scale | `--chakra-font-sizes-{xs..4xl}` (via `--font-scale`) | `theme.fontSizeScale` |
| Border radius | `--chakra-radii-{sm,md,lg,xl,2xl}` | `theme.borderRadius` |
| Spacing scale | `--chakra-spacing-{1..20}` (via `--spacing-scale`) | `theme.spacingScale` |
| Color mode | managed by `next-themes` (`useColorMode`) | `theme` attribute in `<html>` |

---

## Step 1 — Add `brand` Color Palette to `system.ts`

When any Chakra component uses `colorPalette="brand"`, Chakra looks for tokens named `brand.50`, `brand.100`, … `brand.950`. Define those tokens as references to runtime CSS variables:

```ts
// src/shared/vendor/chakra-ui/system.ts
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const brandShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

const brandColorTokens = Object.fromEntries(
  brandShades.map((shade) => [shade, { value: `var(--brand-${shade})` }]),
);

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
      colors: {
        brand: brandColorTokens,
      },
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);
```

Chakra will output into the stylesheet:

```css
:root {
  --chakra-colors-brand-50: var(--brand-50);
  --chakra-colors-brand-500: var(--brand-500);
  /* ... */
}
```

At runtime, `ThemeCssInjector` sets `--brand-50: var(--chakra-colors-teal-50)` (or whichever palette is selected), creating a two-hop CSS variable chain that resolves to the actual Chakra palette hex value.

### How to use brand color in components

```tsx
<Button colorPalette="brand">Submit</Button>
<Badge colorPalette="brand">New</Badge>
<Progress colorPalette="brand" value={60} />
```

---

## Step 2 — Types

```ts
// src/shared/contexts/theme-settings/types.ts

export type BrandColor =
  | "teal"
  | "blue"
  | "violet"
  | "orange"
  | "red"
  | "green"
  | "cyan"
  | "pink";

export type FontSizeScale = "sm" | "md" | "lg";
export type BorderRadiusPreset = "none" | "sm" | "md" | "lg" | "full";
export type SpacingScale = "compact" | "default" | "relaxed";

export interface ThemeSettings {
  brandColor: BrandColor;
  fontSizeScale: FontSizeScale;
  borderRadius: BorderRadiusPreset;
  spacingScale: SpacingScale;
}

export const defaultThemeSettings: ThemeSettings = {
  brandColor: "teal",
  fontSizeScale: "md",
  borderRadius: "md",
  spacingScale: "default",
};
```

---

## Step 3 — Theme Settings Context

```tsx
// src/shared/contexts/theme-settings/theme-settings-context.tsx
"use client";

import { createContext, useContext } from "react";
import { useLocalStorage } from "usehooks-ts";

import { defaultThemeSettings } from "./types";

import type { ThemeSettings } from "./types";

interface ThemeSettingsContextValue {
  settings: ThemeSettings;
  updateSetting: <K extends keyof ThemeSettings>(
    key: K,
    value: ThemeSettings[K],
  ) => void;
  resetSettings: () => void;
}

const ThemeSettingsContext = createContext<ThemeSettingsContextValue | null>(
  null,
);

export function ThemeSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useLocalStorage<ThemeSettings>(
    "theme-settings",
    defaultThemeSettings,
  );

  function updateSetting<K extends keyof ThemeSettings>(
    key: K,
    value: ThemeSettings[K],
  ) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function resetSettings() {
    setSettings(defaultThemeSettings);
  }

  return (
    <ThemeSettingsContext.Provider
      value={{ settings, updateSetting, resetSettings }}
    >
      {children}
    </ThemeSettingsContext.Provider>
  );
}

export function useThemeSettings(): ThemeSettingsContextValue {
  const ctx = useContext(ThemeSettingsContext);
  if (!ctx) {
    throw new Error(
      "useThemeSettings must be used inside ThemeSettingsProvider",
    );
  }
  return ctx;
}
```

---

## Step 4 — CSS Token Maps

Centralise preset-to-CSS-value mappings in a single file so the injector stays clean.

```ts
// src/shared/contexts/theme-settings/token-maps.ts
import type {
  BrandColor,
  BorderRadiusPreset,
  FontSizeScale,
  SpacingScale,
} from "./types";

// ─── Brand color ─────────────────────────────────────────────────────────────
// Each shade maps brand CSS vars to the matching Chakra palette CSS vars.
// Two-hop CSS variable reference: --brand-50 → --chakra-colors-teal-50 → hex
export const BRAND_COLOR_SHADES = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const;

export function getBrandColorVars(
  color: BrandColor,
): Record<string, string> {
  return Object.fromEntries(
    BRAND_COLOR_SHADES.map((shade) => [
      `--brand-${shade}`,
      `var(--chakra-colors-${color}-${shade})`,
    ]),
  );
}

// ─── Font size scale ─────────────────────────────────────────────────────────
// Single CSS variable --font-scale multiplies all Chakra font sizes via calc().
// Requires font-size tokens in system.ts to use calc(base * var(--font-scale, 1)).
export const FONT_SCALE_VALUES: Record<FontSizeScale, string> = {
  sm: "0.875",
  md: "1",
  lg: "1.125",
};

// ─── Border radius ───────────────────────────────────────────────────────────
// Full presets for key Chakra radius tokens.
export const BORDER_RADIUS_VARS: Record<
  BorderRadiusPreset,
  Record<string, string>
> = {
  none: {
    "--chakra-radii-sm": "0px",
    "--chakra-radii-md": "0px",
    "--chakra-radii-lg": "0px",
    "--chakra-radii-xl": "0px",
    "--chakra-radii-2xl": "0px",
  },
  sm: {
    "--chakra-radii-sm": "2px",
    "--chakra-radii-md": "4px",
    "--chakra-radii-lg": "6px",
    "--chakra-radii-xl": "8px",
    "--chakra-radii-2xl": "12px",
  },
  md: {
    // Chakra defaults — unset overrides so Chakra's stylesheet values apply
    "--chakra-radii-sm": "",
    "--chakra-radii-md": "",
    "--chakra-radii-lg": "",
    "--chakra-radii-xl": "",
    "--chakra-radii-2xl": "",
  },
  lg: {
    "--chakra-radii-sm": "6px",
    "--chakra-radii-md": "10px",
    "--chakra-radii-lg": "16px",
    "--chakra-radii-xl": "20px",
    "--chakra-radii-2xl": "28px",
  },
  full: {
    "--chakra-radii-sm": "9999px",
    "--chakra-radii-md": "9999px",
    "--chakra-radii-lg": "9999px",
    "--chakra-radii-xl": "9999px",
    "--chakra-radii-2xl": "9999px",
  },
};

// ─── Spacing scale ───────────────────────────────────────────────────────────
// Single CSS variable --spacing-scale, used with calc() in spacing tokens.
export const SPACING_SCALE_VALUES: Record<SpacingScale, string> = {
  compact: "0.875",
  default: "1",
  relaxed: "1.25",
};
```

---

## Step 5 — CSS Injector Component

```tsx
// src/shared/contexts/theme-settings/theme-css-injector.tsx
"use client";

import { useEffect } from "react";

import { useThemeSettings } from "./theme-settings-context";
import {
  BORDER_RADIUS_VARS,
  FONT_SCALE_VALUES,
  SPACING_SCALE_VALUES,
  getBrandColorVars,
} from "./token-maps";

export function ThemeCssInjector() {
  const { settings } = useThemeSettings();

  useEffect(() => {
    const root = document.documentElement;

    // Brand color
    Object.entries(getBrandColorVars(settings.brandColor)).forEach(
      ([prop, value]) => {
        root.style.setProperty(prop, value);
      },
    );

    // Font size scale
    root.style.setProperty(
      "--font-scale",
      FONT_SCALE_VALUES[settings.fontSizeScale],
    );

    // Spacing scale
    root.style.setProperty(
      "--spacing-scale",
      SPACING_SCALE_VALUES[settings.spacingScale],
    );

    // Border radius
    Object.entries(BORDER_RADIUS_VARS[settings.borderRadius]).forEach(
      ([prop, value]) => {
        if (value === "") {
          root.style.removeProperty(prop);
        } else {
          root.style.setProperty(prop, value);
        }
      },
    );
  }, [settings]);

  // Renders nothing — only a side-effect
  return null;
}
```

---

## Step 6 — Font Scale and Spacing Scale Token Definitions

For `--font-scale` and `--spacing-scale` to work, the relevant tokens in `system.ts` must use `calc()`. Add these to `customConfig` in `system.ts`:

```ts
// Inside defineConfig({ theme: { tokens: { ... } } })

fontSizes: {
  "2xs": { value: "calc(0.625rem * var(--font-scale, 1))" },
  xs:   { value: "calc(0.75rem  * var(--font-scale, 1))" },
  sm:   { value: "calc(0.875rem * var(--font-scale, 1))" },
  md:   { value: "calc(1rem     * var(--font-scale, 1))" },
  lg:   { value: "calc(1.125rem * var(--font-scale, 1))" },
  xl:   { value: "calc(1.25rem  * var(--font-scale, 1))" },
  "2xl":{ value: "calc(1.5rem   * var(--font-scale, 1))" },
  "3xl":{ value: "calc(1.875rem * var(--font-scale, 1))" },
  "4xl":{ value: "calc(2.25rem  * var(--font-scale, 1))" },
  "5xl":{ value: "calc(3rem     * var(--font-scale, 1))" },
  "6xl":{ value: "calc(3.75rem  * var(--font-scale, 1))" },
},

spacing: {
  px:  { value: "1px" },
  0:   { value: "0" },
  0.5: { value: "calc(0.125rem * var(--spacing-scale, 1))" },
  1:   { value: "calc(0.25rem  * var(--spacing-scale, 1))" },
  1.5: { value: "calc(0.375rem * var(--spacing-scale, 1))" },
  2:   { value: "calc(0.5rem   * var(--spacing-scale, 1))" },
  2.5: { value: "calc(0.625rem * var(--spacing-scale, 1))" },
  3:   { value: "calc(0.75rem  * var(--spacing-scale, 1))" },
  4:   { value: "calc(1rem     * var(--spacing-scale, 1))" },
  5:   { value: "calc(1.25rem  * var(--spacing-scale, 1))" },
  6:   { value: "calc(1.5rem   * var(--spacing-scale, 1))" },
  8:   { value: "calc(2rem     * var(--spacing-scale, 1))" },
  10:  { value: "calc(2.5rem   * var(--spacing-scale, 1))" },
  12:  { value: "calc(3rem     * var(--spacing-scale, 1))" },
  16:  { value: "calc(4rem     * var(--spacing-scale, 1))" },
  20:  { value: "calc(5rem     * var(--spacing-scale, 1))" },
},
```

> **Trade-off:** Overriding Chakra's default `spacing` and `fontSizes` tokens means the `defaultConfig` values for those tokens are replaced. Verify that the base values (e.g. `0.75rem` for `xs`) match what Chakra's `defaultConfig` uses before shipping. Check `node_modules/@chakra-ui/preset-base/dist/index.js` for reference values.

---

## Step 7 — Barrel Export

```ts
// src/shared/contexts/theme-settings/index.ts
export { ThemeSettingsProvider, useThemeSettings } from "./theme-settings-context";
export { ThemeCssInjector } from "./theme-css-injector";
export { defaultThemeSettings } from "./types";
export type { ThemeSettings, BrandColor, FontSizeScale, BorderRadiusPreset, SpacingScale } from "./types";
```

---

## Step 8 — Wire into `AppProvider`

```tsx
// src/shared/providers/app-provider/app-provider.tsx
import { ThemeSettingsProvider, ThemeCssInjector } from "@/shared/contexts/theme-settings";

export function AppProvider({ children, locale, now, timeZone }: AppProviderProps) {
  return (
    <NextIntlClientProvider formats={formats} locale={locale} now={now} timeZone={timeZone}>
      <NuqsAdapter>
        <ThemeSettingsProvider>
          <Provider>
            <ThemeCssInjector />
            {children}
            <Toaster />
          </Provider>
        </ThemeSettingsProvider>
      </NuqsAdapter>
    </NextIntlClientProvider>
  );
}
```

`ThemeCssInjector` is placed inside `Provider` (ChakraProvider) so Chakra's CSS variables are already injected into the DOM before `ThemeCssInjector`'s `useEffect` runs.

---

## Step 9 — Settings Page

### Route

```text
src/app/[locale]/(public)/settings/theme/page.tsx
```

### Page component

```tsx
// src/app/[locale]/(public)/settings/theme/page.tsx
import type { NextPageProps } from "@/shared/types/next";

export default function ThemeSettingsPage(_props: NextPageProps) {
  return <ThemeSettingsView />;
}
```

The page is a Server Component — the interactive UI is a separate Client Component:

```tsx
// src/modules/settings/components/theme-settings-view/theme-settings-view.tsx
"use client";

import {
  Box,
  Button,
  Card,
  Grid,
  HStack,
  Heading,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";

import { useColorMode } from "@/shared/vendor/chakra-ui/color-mode";
import { useThemeSettings } from "@/shared/contexts/theme-settings";

import type {
  BrandColor,
  BorderRadiusPreset,
  FontSizeScale,
  SpacingScale,
} from "@/shared/contexts/theme-settings";

// ─── Color swatches ───────────────────────────────────────────────────────────

const BRAND_COLORS: { value: BrandColor; label: string }[] = [
  { value: "teal",   label: "Teal"   },
  { value: "blue",   label: "Blue"   },
  { value: "violet", label: "Violet" },
  { value: "orange", label: "Orange" },
  { value: "red",    label: "Red"    },
  { value: "green",  label: "Green"  },
  { value: "cyan",   label: "Cyan"   },
  { value: "pink",   label: "Pink"   },
];

export function ThemeSettingsView() {
  const { settings, updateSetting, resetSettings } = useThemeSettings();
  const { colorMode, setColorMode } = useColorMode();

  return (
    <VStack align="stretch" gap={8} maxW="2xl" mx="auto" px={4} py={12}>
      <Heading size="xl">Theme Settings</Heading>

      {/* ─── Brand Color ─── */}
      <Card.Root>
        <Card.Header>
          <Heading size="md">Brand Color</Heading>
          <Text color="fg.muted" fontSize="sm">
            Applied globally to interactive elements (buttons, links, focus rings).
          </Text>
        </Card.Header>
        <Card.Body>
          <HStack gap={3} flexWrap="wrap">
            {BRAND_COLORS.map(({ value, label }) => (
              <Box
                key={value}
                aria-label={label}
                aria-pressed={settings.brandColor === value}
                as="button"
                borderRadius="full"
                boxSize={9}
                cursor="pointer"
                outline={settings.brandColor === value ? "3px solid" : "none"}
                outlineColor={`${value}.500`}
                outlineOffset="2px"
                style={{ backgroundColor: `var(--chakra-colors-${value}-500)` }}
                title={label}
                onClick={() => updateSetting("brandColor", value)}
              />
            ))}
          </HStack>
        </Card.Body>
      </Card.Root>

      <Separator />

      {/* ─── Font Size Scale ─── */}
      <Card.Root>
        <Card.Header>
          <Heading size="md">Font Size</Heading>
        </Card.Header>
        <Card.Body>
          <HStack gap={3}>
            {(["sm", "md", "lg"] as FontSizeScale[]).map((scale) => (
              <Button
                key={scale}
                colorPalette="brand"
                variant={settings.fontSizeScale === scale ? "solid" : "outline"}
                onClick={() => updateSetting("fontSizeScale", scale)}
              >
                {scale === "sm" ? "Small" : scale === "md" ? "Default" : "Large"}
              </Button>
            ))}
          </HStack>
          <Text color="fg.muted" fontSize="sm" mt={2}>
            Current scale: ×{scale === "sm" ? "0.875" : scale === "md" ? "1.0" : "1.125"}
          </Text>
        </Card.Body>
      </Card.Root>

      <Separator />

      {/* ─── Border Radius ─── */}
      <Card.Root>
        <Card.Header>
          <Heading size="md">Corner Radius</Heading>
        </Card.Header>
        <Card.Body>
          <Grid gap={3} templateColumns="repeat(5, 1fr)">
            {(["none", "sm", "md", "lg", "full"] as BorderRadiusPreset[]).map(
              (preset) => (
                <Button
                  key={preset}
                  colorPalette="brand"
                  variant={
                    settings.borderRadius === preset ? "solid" : "outline"
                  }
                  onClick={() => updateSetting("borderRadius", preset)}
                >
                  {preset.charAt(0).toUpperCase() + preset.slice(1)}
                </Button>
              ),
            )}
          </Grid>
        </Card.Body>
      </Card.Root>

      <Separator />

      {/* ─── Spacing Scale ─── */}
      <Card.Root>
        <Card.Header>
          <Heading size="md">Density</Heading>
        </Card.Header>
        <Card.Body>
          <HStack gap={3}>
            {(["compact", "default", "relaxed"] as SpacingScale[]).map(
              (scale) => (
                <Button
                  key={scale}
                  colorPalette="brand"
                  variant={
                    settings.spacingScale === scale ? "solid" : "outline"
                  }
                  onClick={() => updateSetting("spacingScale", scale)}
                >
                  {scale.charAt(0).toUpperCase() + scale.slice(1)}
                </Button>
              ),
            )}
          </HStack>
        </Card.Body>
      </Card.Root>

      <Separator />

      {/* ─── Color Mode ─── */}
      <Card.Root>
        <Card.Header>
          <Heading size="md">Color Mode</Heading>
        </Card.Header>
        <Card.Body>
          <HStack gap={3}>
            {(["light", "dark", "system"] as const).map((mode) => (
              <Button
                key={mode}
                colorPalette="brand"
                variant={colorMode === mode ? "solid" : "outline"}
                onClick={() => setColorMode(mode as "light" | "dark")}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </HStack>
        </Card.Body>
      </Card.Root>

      <Separator />

      {/* ─── Reset ─── */}
      <HStack justify="flex-end">
        <Button colorPalette="gray" variant="ghost" onClick={resetSettings}>
          Reset to defaults
        </Button>
      </HStack>
    </VStack>
  );
}
```

---

## Final Directory Structure

```text
src/
  shared/
    contexts/
      theme-settings/
        index.ts                       ← barrel export
        types.ts                       ← ThemeSettings, BrandColor, etc.
        token-maps.ts                  ← preset → CSS variable mappings
        theme-settings-context.tsx     ← React context + useLocalStorage
        theme-css-injector.tsx         ← useEffect → documentElement.style
    vendor/
      chakra-ui/
        system.ts                      ← updated: brand tokens + font/spacing calc()
    providers/
      app-provider/
        app-provider.tsx               ← updated: ThemeSettingsProvider + ThemeCssInjector
  modules/
    settings/
      components/
        theme-settings-view/
          theme-settings-view.tsx      ← client UI
  app/
    [locale]/
      (public)/
        settings/
          theme/
            page.tsx                   ← server page → renders ThemeSettingsView
```

---

## Caveats and Known Limitations

### FOUC (Flash of Unstyled Content)

On initial load, `ThemeCssInjector` runs its `useEffect` only after hydration. During SSR and the hydration phase, the default Chakra theme (teal brand) is used. If the user saved a different brand color, there will be a brief flash.

**Mitigation:** Inject a `<script>` tag in the root layout that reads `localStorage` and sets CSS variables synchronously before React hydrates:

```tsx
// src/app/[locale]/layout.tsx — inside <head>
<script
  dangerouslySetInnerHTML={{
    __html: `
      try {
        var s = JSON.parse(localStorage.getItem('theme-settings') || '{}');
        var shades = [50,100,200,300,400,500,600,700,800,900,950];
        var color = s.brandColor || 'teal';
        shades.forEach(function(n) {
          document.documentElement.style.setProperty(
            '--brand-' + n,
            'var(--chakra-colors-' + color + '-' + n + ')'
          );
        });
        if (s.fontSizeScale)
          document.documentElement.style.setProperty('--font-scale', {'sm':'0.875','md':'1','lg':'1.125'}[s.fontSizeScale] || '1');
        if (s.spacingScale)
          document.documentElement.style.setProperty('--spacing-scale', {'compact':'0.875','default':'1','relaxed':'1.25'}[s.spacingScale] || '1');
      } catch(e) {}
    `,
  }}
/>
```

This script executes synchronously before paint, eliminating FOUC.

### Font and Spacing `calc()` Performance

Setting all font size and spacing tokens to `calc(base * var(--font-scale, 1))` adds a trivial layout cost. Modern browsers resolve CSS custom properties and `calc()` in the style cascade — no measurable rendering impact on typical pages.

### SSR Consistency

`useLocalStorage` returns the `initialValue` during SSR (the default settings). The inline script in the layout handles the client-side sync. The first render is always the default theme; the script patches CSS variables before paint.
