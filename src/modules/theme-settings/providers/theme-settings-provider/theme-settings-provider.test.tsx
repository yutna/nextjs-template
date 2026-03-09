import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ThemeSettingsProvider } from "./theme-settings-provider";

vi.mock("@/modules/theme-settings/lib/theme-storage", () => ({
  clearThemeCssVars: vi.fn(),
  loadThemeCssVars: vi.fn().mockReturnValue(null),
  loadThemePresetId: vi.fn().mockReturnValue(null),
  saveThemeCssVars: vi.fn(),
  saveThemePresetId: vi.fn(),
}));
vi.mock("@/modules/theme-settings/lib/theme-injector", () => ({
  clearThemeCssVars: vi.fn(),
  injectThemeCssVars: vi.fn(),
}));

describe("ThemeSettingsProvider", () => {
  it("renders children without errors", () => {
    const { getByText } = renderWithProviders(
      <ThemeSettingsProvider>
        <span>child content</span>
      </ThemeSettingsProvider>,
    );

    expect(getByText("child content")).toBeDefined();
  });
});
