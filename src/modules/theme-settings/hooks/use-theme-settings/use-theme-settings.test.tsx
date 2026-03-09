import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ThemeSettingsProvider } from "@/modules/theme-settings/providers/theme-settings-provider";
import { renderWithProviders } from "@/test/render-with-providers";

import { useThemeSettings } from "./use-theme-settings";

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

describe("useThemeSettings", () => {
  it("throws when used outside ThemeSettingsProvider", () => {
    function TestComponent() {
      useThemeSettings();
      return null;
    }

    expect(() => renderWithProviders(<TestComponent />)).toThrow(
      "useThemeSettings must be used within ThemeSettingsProvider",
    );
  });

  it("returns default preset ID when no storage", () => {
    function TestComponent() {
      const { activePresetId } = useThemeSettings();
      return <div data-testid="preset-id">{activePresetId}</div>;
    }

    renderWithProviders(
      <ThemeSettingsProvider>
        <TestComponent />
      </ThemeSettingsProvider>,
    );

    expect(screen.getByTestId("preset-id")).toHaveTextContent("default");
  });
});
