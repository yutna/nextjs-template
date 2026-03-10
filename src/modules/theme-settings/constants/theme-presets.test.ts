import { describe, expect, it } from "vitest";

import { COMPLETE_THEME_PRESET_CSS_VAR_KEYS } from "@/modules/theme-settings/utils/complete-theme-preset-css-vars";

import { THEME_PRESETS } from "./theme-presets";

describe("THEME_PRESETS", () => {
  it("provides complete semantic coverage for every preset in light and dark mode", () => {
    for (const preset of THEME_PRESETS.filter(({ id }) => id !== "default")) {
      expect(Object.keys(preset.cssVars.light)).toEqual(
        expect.arrayContaining([...COMPLETE_THEME_PRESET_CSS_VAR_KEYS]),
      );
      expect(Object.keys(preset.cssVars.dark)).toEqual(
        expect.arrayContaining([...COMPLETE_THEME_PRESET_CSS_VAR_KEYS]),
      );
    }
  });

  it("keeps preset IDs unique", () => {
    const ids = THEME_PRESETS.map((preset) => preset.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
