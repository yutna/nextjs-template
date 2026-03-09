import { describe, expect, it, vi } from "vitest";

import {
  clearThemeCssVars,
  loadThemeCssVars,
  loadThemePresetId,
  saveThemeCssVars,
  saveThemePresetId,
} from "./theme-storage";

const mockStorage: Record<string, string> = {};

vi.stubGlobal("localStorage", {
  getItem: (key: string) => mockStorage[key] ?? null,
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
});

describe("theme-storage", () => {
  it("saves and loads CSS vars", () => {
    const vars = {
      dark: { "--chakra-colors-bg": "#000000" },
      light: { "--chakra-colors-bg": "#ffffff" },
    };

    saveThemeCssVars(vars);
    expect(loadThemeCssVars()).toEqual(vars);
  });

  it("returns null when no CSS vars are stored", () => {
    clearThemeCssVars();
    expect(loadThemeCssVars()).toBeNull();
  });

  it("clears stored CSS vars", () => {
    saveThemeCssVars({
      dark: { "--chakra-colors-bg": "#000000" },
      light: { "--chakra-colors-bg": "#ffffff" },
    });
    clearThemeCssVars();
    expect(loadThemeCssVars()).toBeNull();
  });

  it("saves and loads preset ID", () => {
    saveThemePresetId("cyberpunk");
    expect(loadThemePresetId()).toBe("cyberpunk");
  });

  it("returns null when no preset ID is stored", () => {
    delete mockStorage["theme-preset-id"];
    expect(loadThemePresetId()).toBeNull();
  });
});
