import { describe, expect, it } from "vitest";

import {
  COMPLETE_THEME_PRESET_CSS_VAR_KEYS,
  completeThemePresetCssVars,
} from "./complete-theme-preset-css-vars";

import type { ThemePresetCssVars } from "@/modules/theme-settings/types";

function createPaletteVars(
  palette: string,
  values: {
    border: string;
    contrast: string;
    emphasized: string;
    fg: string;
    focusRing: string;
    muted: string;
    solid: string;
    subtle: string;
  },
) {
  return {
    [`--chakra-colors-${palette}-border`]: values.border,
    [`--chakra-colors-${palette}-contrast`]: values.contrast,
    [`--chakra-colors-${palette}-emphasized`]: values.emphasized,
    [`--chakra-colors-${palette}-fg`]: values.fg,
    [`--chakra-colors-${palette}-focus-ring`]: values.focusRing,
    [`--chakra-colors-${palette}-muted`]: values.muted,
    [`--chakra-colors-${palette}-solid`]: values.solid,
    [`--chakra-colors-${palette}-subtle`]: values.subtle,
  };
}

function createModeVars() {
  return {
    ...createPaletteVars("blue", {
      border: "#bbdefb",
      contrast: "#ffffff",
      emphasized: "#9dd0fa",
      fg: "#1565c0",
      focusRing: "#2196f3",
      muted: "#bbdefb",
      solid: "#2196f3",
      subtle: "#e3f2fd",
    }),
    ...createPaletteVars("gray", {
      border: "#99a3a4",
      contrast: "#ffffff",
      emphasized: "#aeb6bf",
      fg: "#2c3e50",
      focusRing: "#7f8c8d",
      muted: "#d5d8dc",
      solid: "#7f8c8d",
      subtle: "#f2f3f4",
    }),
    ...createPaletteVars("green", {
      border: "#88ddaa",
      contrast: "#ffffff",
      emphasized: "#a8ecc8",
      fg: "#1a7a42",
      focusRing: "#27ae60",
      muted: "#c8f5e0",
      solid: "#27ae60",
      subtle: "#e8fff2",
    }),
    ...createPaletteVars("orange", {
      border: "#ffbb66",
      contrast: "#ffffff",
      emphasized: "#ffcb77",
      fg: "#9a6200",
      focusRing: "#d4860a",
      muted: "#ffdda0",
      solid: "#d4860a",
      subtle: "#fff5e0",
    }),
    ...createPaletteVars("red", {
      border: "#ffaaaa",
      contrast: "#ffffff",
      emphasized: "#ffb5b5",
      fg: "#8b2519",
      focusRing: "#c0392b",
      muted: "#ffd5d5",
      solid: "#c0392b",
      subtle: "#fff0f0",
    }),
    "--chakra-radii-l1": "0px",
    "--chakra-shadows-xl": "none",
    "--chakra-shadows-xs": "none",
  };
}

describe("completeThemePresetCssVars", () => {
  it("fills the missing semantic surface variables from the preset palettes", () => {
    const cssVars: ThemePresetCssVars = {
      dark: createModeVars(),
      light: createModeVars(),
    };

    const completed = completeThemePresetCssVars(cssVars);

    expect(completed.light["--chakra-colors-bg"]).toBe(
      "var(--chakra-colors-white)",
    );
    expect(completed.dark["--chakra-colors-bg"]).toBe(
      "var(--chakra-colors-gray-subtle)",
    );
    expect(completed.light["--chakra-colors-fg"]).toBe(
      "var(--chakra-colors-gray-fg)",
    );
    expect(completed.light["--chakra-colors-border"]).toBe(
      "var(--chakra-colors-gray-border)",
    );
    expect(completed.light["--chakra-colors-bg-info"]).toBe(
      "var(--chakra-colors-blue-subtle)",
    );
    expect(completed.light["--chakra-colors-fg-success"]).toBe(
      "var(--chakra-colors-green-fg)",
    );
  });

  it("fills missing color-palette aliases and shadow fallbacks", () => {
    const cssVars: ThemePresetCssVars = {
      dark: createModeVars(),
      light: {
        ...createModeVars(),
        "--chakra-colors-color-palette-solid": "#123456",
      },
    };

    const completed = completeThemePresetCssVars(cssVars);

    expect(completed.light["--chakra-colors-color-palette-solid"]).toBe(
      "#123456",
    );
    expect(completed.dark["--chakra-colors-color-palette-solid"]).toBe(
      "var(--chakra-colors-blue-solid)",
    );
    expect(completed.light["--chakra-shadows-2xl"]).toBe("none");
    expect(completed.light["--chakra-shadows-inner"]).toBe("none");
    expect(completed.light["--chakra-shadows-inset"]).toBe("none");
  });

  it("exports the complete semantic coverage keys used by presets", () => {
    expect(COMPLETE_THEME_PRESET_CSS_VAR_KEYS).toEqual(
      expect.arrayContaining([
        "--chakra-colors-bg",
        "--chakra-colors-border",
        "--chakra-colors-color-palette-solid",
        "--chakra-colors-fg",
        "--chakra-radii-l1",
        "--chakra-shadows-2xl",
      ]),
    );
  });
});
