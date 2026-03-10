import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ContainerThemeSettings } from "./container-theme-settings";

const { mockUseThemeSettings } = vi.hoisted(() => ({
  mockUseThemeSettings: vi.fn(() => ({
    activePresetId: "default",
    activePreviewGroup: "overview",
    colorMode: "light",
    currentPreset: {
      cssVars: { dark: {}, light: {} },
      description: "Balanced colors and spacing",
      id: "default",
      name: "Default",
      swatches: ["#3182CE"],
    },
    handleChangePreviewGroup: vi.fn(),
    handleResetToDefault: vi.fn(),
    handleSavePreset: vi.fn(),
    handleSelectPreset: vi.fn(),
    handleSwitchColorMode: vi.fn(),
    handleSwitchLocale: vi.fn(),
    hasPendingChanges: false,
    pendingPresetId: null,
    previewVars: {},
  })),
}));

vi.mock("@/modules/theme-settings/hooks/use-theme-settings", () => ({
  useThemeSettings: mockUseThemeSettings,
}));
vi.mock("@/modules/theme-settings/components/card-theme-preset", () => ({
  CardThemePreset: () => <div>preset-card</div>,
}));
vi.mock("@/modules/theme-settings/components/preview-theme", () => ({
  PreviewTheme: () => <div>theme-preview</div>,
}));

describe("ContainerThemeSettings", () => {
  it("passes the locale to the theme settings hook", () => {
    renderWithProviders(<ContainerThemeSettings locale="en" />);

    expect(mockUseThemeSettings).toHaveBeenCalledWith({ locale: "en" });
    expect(screen.getByText("theme-preview")).toBeInTheDocument();
  });
});
