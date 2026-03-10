import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockClearThemeCssVars = vi.hoisted(() => vi.fn());
const mockInjectThemeCssVars = vi.hoisted(() => vi.fn());
const mockLoadThemeCssVars = vi.hoisted(() => vi.fn());
const mockLoadThemePresetId = vi.hoisted(() => vi.fn());
let mockColorMode: "dark" | "light" = "light";

vi.mock("@/shared/vendor/chakra-ui/color-mode", () => ({
  useColorMode: vi.fn(() => ({
    colorMode: mockColorMode,
    setColorMode: vi.fn(),
    toggleColorMode: vi.fn(),
  })),
}));
vi.mock("@/modules/theme-settings/lib/theme-storage", () => ({
  clearThemeCssVars: vi.fn(),
  loadThemeCssVars: mockLoadThemeCssVars,
  loadThemePresetId: mockLoadThemePresetId,
  saveThemeCssVars: vi.fn(),
  saveThemePresetId: vi.fn(),
}));
vi.mock("@/modules/theme-settings/lib/theme-injector", () => ({
  clearThemeCssVars: mockClearThemeCssVars,
  injectThemeCssVars: mockInjectThemeCssVars,
}));

import { ThemeSettingsProvider } from "./theme-settings-provider";

beforeEach(() => {
  vi.clearAllMocks();
  mockColorMode = "light";
  mockLoadThemeCssVars.mockReturnValue({
    dark: { "--chakra-colors-bg": "#000000" },
    light: { "--chakra-colors-bg": "#ffffff" },
  });
  mockLoadThemePresetId.mockReturnValue("default");
});

describe("ThemeSettingsProvider", () => {
  it("renders children without errors", () => {
    const { getByText } = render(
      <ThemeSettingsProvider>
        <span>child content</span>
      </ThemeSettingsProvider>,
    );

    expect(getByText("child content")).toBeDefined();
  });

  it("applies stored CSS vars for the current color mode", () => {
    render(
      <ThemeSettingsProvider>
        <span>child content</span>
      </ThemeSettingsProvider>,
    );

    expect(mockClearThemeCssVars).toHaveBeenCalledWith(expect.any(Array));
    expect(mockInjectThemeCssVars).toHaveBeenCalledWith({
      "--chakra-colors-bg": "#ffffff",
    });
  });

  it("reapplies stored CSS vars after the color mode changes", () => {
    const { rerender } = render(
      <ThemeSettingsProvider>
        <span>child content</span>
      </ThemeSettingsProvider>,
    );

    mockColorMode = "dark";

    rerender(
      <ThemeSettingsProvider>
        <span>child content</span>
      </ThemeSettingsProvider>,
    );

    expect(mockInjectThemeCssVars).toHaveBeenLastCalledWith({
      "--chakra-colors-bg": "#000000",
    });
  });
});
