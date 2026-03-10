import type { ThemePresetCssVars } from "@/modules/theme-settings/types";

type ThemeColorMode = keyof ThemePresetCssVars;
type ThemeCssVarsMap = ThemePresetCssVars[ThemeColorMode];

const DEFAULT_THEME_SURFACE_VARS: ThemePresetCssVars = {
  dark: {
    "--chakra-colors-bg": "var(--chakra-colors-black)",
    "--chakra-colors-bg-emphasized": "var(--chakra-colors-gray-800)",
    "--chakra-colors-bg-error": "var(--chakra-colors-red-950)",
    "--chakra-colors-bg-info": "var(--chakra-colors-blue-950)",
    "--chakra-colors-bg-inverted": "var(--chakra-colors-white)",
    "--chakra-colors-bg-muted": "var(--chakra-colors-gray-900)",
    "--chakra-colors-bg-panel": "var(--chakra-colors-gray-950)",
    "--chakra-colors-bg-subtle": "var(--chakra-colors-gray-950)",
    "--chakra-colors-bg-success": "var(--chakra-colors-green-950)",
    "--chakra-colors-bg-warning": "var(--chakra-colors-orange-950)",
    "--chakra-colors-border": "var(--chakra-colors-gray-800)",
    "--chakra-colors-border-emphasized": "var(--chakra-colors-gray-700)",
    "--chakra-colors-border-error": "var(--chakra-colors-red-400)",
    "--chakra-colors-border-info": "var(--chakra-colors-blue-400)",
    "--chakra-colors-border-inverted": "var(--chakra-colors-gray-200)",
    "--chakra-colors-border-muted": "var(--chakra-colors-gray-900)",
    "--chakra-colors-border-subtle": "var(--chakra-colors-gray-950)",
    "--chakra-colors-border-success": "var(--chakra-colors-green-400)",
    "--chakra-colors-border-warning": "var(--chakra-colors-orange-400)",
    "--chakra-colors-fg": "var(--chakra-colors-gray-50)",
    "--chakra-colors-fg-error": "var(--chakra-colors-red-400)",
    "--chakra-colors-fg-info": "var(--chakra-colors-blue-300)",
    "--chakra-colors-fg-inverted": "var(--chakra-colors-black)",
    "--chakra-colors-fg-muted": "var(--chakra-colors-gray-400)",
    "--chakra-colors-fg-subtle": "var(--chakra-colors-gray-500)",
    "--chakra-colors-fg-success": "var(--chakra-colors-green-300)",
    "--chakra-colors-fg-warning": "var(--chakra-colors-orange-300)",
    "--chakra-radii-l1": "var(--chakra-radii-xs)",
    "--chakra-radii-l2": "var(--chakra-radii-sm)",
    "--chakra-radii-l3": "var(--chakra-radii-md)",
    "--chakra-shadows-2xl":
      "0px 24px 40px rgb(24 24 27 / 0.64), 0px 0px 1px inset rgb(212 212 216 / 0.3)",
    "--chakra-shadows-inner": "inset 0 2px 4px 0 rgb(0 0 0)",
    "--chakra-shadows-inset": "inset 0 0 0 1px rgb(212 212 216 / 0.05)",
  },
  light: {
    "--chakra-colors-bg": "var(--chakra-colors-white)",
    "--chakra-colors-bg-emphasized": "var(--chakra-colors-gray-200)",
    "--chakra-colors-bg-error": "var(--chakra-colors-red-50)",
    "--chakra-colors-bg-info": "var(--chakra-colors-blue-50)",
    "--chakra-colors-bg-inverted": "var(--chakra-colors-black)",
    "--chakra-colors-bg-muted": "var(--chakra-colors-gray-100)",
    "--chakra-colors-bg-panel": "var(--chakra-colors-white)",
    "--chakra-colors-bg-subtle": "var(--chakra-colors-gray-50)",
    "--chakra-colors-bg-success": "var(--chakra-colors-green-50)",
    "--chakra-colors-bg-warning": "var(--chakra-colors-orange-50)",
    "--chakra-colors-border": "var(--chakra-colors-gray-200)",
    "--chakra-colors-border-emphasized": "var(--chakra-colors-gray-300)",
    "--chakra-colors-border-error": "var(--chakra-colors-red-500)",
    "--chakra-colors-border-info": "var(--chakra-colors-blue-500)",
    "--chakra-colors-border-inverted": "var(--chakra-colors-gray-800)",
    "--chakra-colors-border-muted": "var(--chakra-colors-gray-100)",
    "--chakra-colors-border-subtle": "var(--chakra-colors-gray-50)",
    "--chakra-colors-border-success": "var(--chakra-colors-green-500)",
    "--chakra-colors-border-warning": "var(--chakra-colors-orange-500)",
    "--chakra-colors-fg": "var(--chakra-colors-black)",
    "--chakra-colors-fg-error": "var(--chakra-colors-red-500)",
    "--chakra-colors-fg-info": "var(--chakra-colors-blue-600)",
    "--chakra-colors-fg-inverted": "var(--chakra-colors-gray-50)",
    "--chakra-colors-fg-muted": "var(--chakra-colors-gray-600)",
    "--chakra-colors-fg-subtle": "var(--chakra-colors-gray-400)",
    "--chakra-colors-fg-success": "var(--chakra-colors-green-600)",
    "--chakra-colors-fg-warning": "var(--chakra-colors-orange-600)",
    "--chakra-radii-l1": "var(--chakra-radii-xs)",
    "--chakra-radii-l2": "var(--chakra-radii-sm)",
    "--chakra-radii-l3": "var(--chakra-radii-md)",
    "--chakra-shadows-2xl":
      "0px 24px 40px rgb(24 24 27 / 0.16), 0px 0px 1px rgb(24 24 27 / 0.3)",
    "--chakra-shadows-inner": "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    "--chakra-shadows-inset": "inset 0 0 0 1px rgb(0 0 0 / 0.05)",
  },
};

const COLOR_PALETTE_ALIAS_KEYS = [
  "border",
  "contrast",
  "emphasized",
  "fg",
  "focus-ring",
  "muted",
  "solid",
  "subtle",
] as const;

const COMPLETE_THEME_PRESET_CSS_VAR_KEYS = [
  "--chakra-colors-bg",
  "--chakra-colors-bg-emphasized",
  "--chakra-colors-bg-error",
  "--chakra-colors-bg-info",
  "--chakra-colors-bg-inverted",
  "--chakra-colors-bg-muted",
  "--chakra-colors-bg-panel",
  "--chakra-colors-bg-subtle",
  "--chakra-colors-bg-success",
  "--chakra-colors-bg-warning",
  "--chakra-colors-border",
  "--chakra-colors-border-emphasized",
  "--chakra-colors-border-error",
  "--chakra-colors-border-info",
  "--chakra-colors-border-inverted",
  "--chakra-colors-border-muted",
  "--chakra-colors-border-subtle",
  "--chakra-colors-border-success",
  "--chakra-colors-border-warning",
  "--chakra-colors-color-palette-border",
  "--chakra-colors-color-palette-contrast",
  "--chakra-colors-color-palette-emphasized",
  "--chakra-colors-color-palette-fg",
  "--chakra-colors-color-palette-focus-ring",
  "--chakra-colors-color-palette-muted",
  "--chakra-colors-color-palette-solid",
  "--chakra-colors-color-palette-subtle",
  "--chakra-colors-fg",
  "--chakra-colors-fg-error",
  "--chakra-colors-fg-info",
  "--chakra-colors-fg-inverted",
  "--chakra-colors-fg-muted",
  "--chakra-colors-fg-subtle",
  "--chakra-colors-fg-success",
  "--chakra-colors-fg-warning",
  "--chakra-radii-l1",
  "--chakra-radii-l2",
  "--chakra-radii-l3",
  "--chakra-shadows-2xl",
  "--chakra-shadows-inner",
  "--chakra-shadows-inset",
] as const;

function buildSurfaceSemanticVars(colorMode: ThemeColorMode): ThemeCssVarsMap {
  return {
    "--chakra-colors-bg":
      colorMode === "light"
        ? "var(--chakra-colors-white)"
        : "var(--chakra-colors-gray-subtle)",
    "--chakra-colors-bg-emphasized": "var(--chakra-colors-gray-emphasized)",
    "--chakra-colors-bg-error": "var(--chakra-colors-red-subtle)",
    "--chakra-colors-bg-info": "var(--chakra-colors-blue-subtle)",
    "--chakra-colors-bg-inverted": "var(--chakra-colors-gray-fg)",
    "--chakra-colors-bg-muted": "var(--chakra-colors-gray-muted)",
    "--chakra-colors-bg-panel":
      colorMode === "light"
        ? "var(--chakra-colors-white)"
        : "var(--chakra-colors-gray-subtle)",
    "--chakra-colors-bg-subtle": "var(--chakra-colors-gray-subtle)",
    "--chakra-colors-bg-success": "var(--chakra-colors-green-subtle)",
    "--chakra-colors-bg-warning": "var(--chakra-colors-orange-subtle)",
    "--chakra-colors-border": "var(--chakra-colors-gray-border)",
    "--chakra-colors-border-emphasized": "var(--chakra-colors-gray-emphasized)",
    "--chakra-colors-border-error": "var(--chakra-colors-red-border)",
    "--chakra-colors-border-info": "var(--chakra-colors-blue-border)",
    "--chakra-colors-border-inverted": "var(--chakra-colors-gray-fg)",
    "--chakra-colors-border-muted": "var(--chakra-colors-gray-muted)",
    "--chakra-colors-border-subtle": "var(--chakra-colors-gray-subtle)",
    "--chakra-colors-border-success": "var(--chakra-colors-green-border)",
    "--chakra-colors-border-warning": "var(--chakra-colors-orange-border)",
    "--chakra-colors-fg": "var(--chakra-colors-gray-fg)",
    "--chakra-colors-fg-error": "var(--chakra-colors-red-fg)",
    "--chakra-colors-fg-info": "var(--chakra-colors-blue-fg)",
    "--chakra-colors-fg-inverted": "var(--chakra-colors-gray-contrast)",
    "--chakra-colors-fg-muted": "var(--chakra-colors-gray-solid)",
    "--chakra-colors-fg-subtle": "var(--chakra-colors-gray-focus-ring)",
    "--chakra-colors-fg-success": "var(--chakra-colors-green-fg)",
    "--chakra-colors-fg-warning": "var(--chakra-colors-orange-fg)",
  };
}

function buildColorPaletteAliasVars(): ThemeCssVarsMap {
  return Object.fromEntries(
    COLOR_PALETTE_ALIAS_KEYS.map((key) => [
      `--chakra-colors-color-palette-${key}`,
      `var(--chakra-colors-blue-${key})`,
    ]),
  );
}

function buildShadowFallbackVars(vars: ThemeCssVarsMap): ThemeCssVarsMap {
  const shadowKeys = Object.keys(vars).filter((key) =>
    key.startsWith("--chakra-shadows-"),
  );

  if (shadowKeys.length === 0) {
    return {};
  }

  const shadowFallback =
    vars["--chakra-shadows-xs"] ??
    vars["--chakra-shadows-sm"] ??
    vars["--chakra-shadows-md"] ??
    vars["--chakra-shadows-lg"] ??
    vars["--chakra-shadows-xl"] ??
    "none";

  return {
    "--chakra-shadows-2xl":
      vars["--chakra-shadows-2xl"] ??
      vars["--chakra-shadows-xl"] ??
      vars["--chakra-shadows-lg"] ??
      shadowFallback,
    "--chakra-shadows-inner": vars["--chakra-shadows-inner"] ?? shadowFallback,
    "--chakra-shadows-inset": vars["--chakra-shadows-inset"] ?? shadowFallback,
  };
}

function completeModeThemeCssVars(
  colorMode: ThemeColorMode,
  vars: ThemeCssVarsMap,
): ThemeCssVarsMap {
  const hasColorOverrides = Object.keys(vars).some((key) =>
    key.startsWith("--chakra-colors-"),
  );

  return {
    ...DEFAULT_THEME_SURFACE_VARS[colorMode],
    ...(hasColorOverrides ? buildSurfaceSemanticVars(colorMode) : {}),
    ...(hasColorOverrides ? buildColorPaletteAliasVars() : {}),
    ...buildShadowFallbackVars(vars),
    ...vars,
  };
}

export function completeThemePresetCssVars(
  cssVars: ThemePresetCssVars,
): ThemePresetCssVars {
  return {
    dark: completeModeThemeCssVars("dark", cssVars.dark),
    light: completeModeThemeCssVars("light", cssVars.light),
  };
}

export { COMPLETE_THEME_PRESET_CSS_VAR_KEYS };
