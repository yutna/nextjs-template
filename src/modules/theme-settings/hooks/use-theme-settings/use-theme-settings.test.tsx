import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ReactNode } from "react";

const mockReplace = vi.fn();
const mockSetColorMode = vi.fn();
let mockColorMode: "dark" | "light" = "light";

vi.mock("@/shared/lib/navigation", () => ({
  usePathname: vi.fn(() => "/settings/themes"),
  useRouter: vi.fn(() => ({ replace: mockReplace })),
}));
vi.mock("@/shared/vendor/chakra-ui/color-mode", () => ({
  useColorMode: vi.fn(() => ({
    colorMode: mockColorMode,
    setColorMode: mockSetColorMode,
    toggleColorMode: vi.fn(),
  })),
}));
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

import { ThemeSettingsProvider } from "@/modules/theme-settings/providers/theme-settings-provider";

import { useThemeSettings } from "./use-theme-settings";

describe("useThemeSettings", () => {
  function wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return <ThemeSettingsProvider>{children}</ThemeSettingsProvider>;
  }

  it("throws when used outside ThemeSettingsProvider", () => {
    expect(() => renderHook(() => useThemeSettings({ locale: "en" }))).toThrow(
      "useThemeSettings must be used within ThemeSettingsProvider",
    );
  });

  it("returns default preview settings when initialized", () => {
    const { result } = renderHook(() => useThemeSettings({ locale: "en" }), {
      wrapper,
    });

    expect(result.current.activePresetId).toBe("default");
    expect(result.current.activePreviewGroup).toBe("overview");
    expect(result.current.colorMode).toBe("light");
  });

  it("switches locale and color mode through shared navigation hooks", () => {
    const { result } = renderHook(() => useThemeSettings({ locale: "en" }), {
      wrapper,
    });

    act(() => {
      result.current.handleSwitchLocale("th");
      result.current.handleSwitchColorMode("dark");
    });

    expect(mockReplace).toHaveBeenCalledWith("/settings/themes", {
      locale: "th",
    });
    expect(mockSetColorMode).toHaveBeenCalledWith("dark");
  });

  it("updates pending preview vars when the color mode changes", () => {
    const { rerender, result } = renderHook(
      () => useThemeSettings({ locale: "en" }),
      { wrapper },
    );

    act(() => {
      result.current.handleSelectPreset(result.current.currentPreset);
    });

    expect(result.current.previewVars).toEqual(
      result.current.currentPreset.cssVars.light,
    );

    mockColorMode = "dark";
    rerender();

    expect(result.current.previewVars).toEqual(
      result.current.currentPreset.cssVars.dark,
    );
  });
});
