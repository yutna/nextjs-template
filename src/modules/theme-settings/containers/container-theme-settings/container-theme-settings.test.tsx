import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ContainerThemeSettings } from "./container-theme-settings";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));
vi.mock("@/modules/theme-settings/hooks/use-theme-settings", () => ({
  useThemeSettings: vi.fn(() => ({
    activePresetId: "default",
    handleResetToDefault: vi.fn(),
    handleSavePreset: vi.fn(),
    handleSelectPreset: vi.fn(),
    pendingPresetId: null,
    previewVars: {},
  })),
}));
vi.mock("@/modules/theme-settings/components/card-theme-preset", () => ({
  CardThemePreset: () => null,
}));
vi.mock("@/modules/theme-settings/components/preview-theme", () => ({
  PreviewTheme: () => null,
}));

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      matches: false,
      removeEventListener: vi.fn(),
    }),
  });
});

describe("ContainerThemeSettings", () => {
  it("renders without errors", () => {
    const { container } = renderWithProviders(<ContainerThemeSettings />);
    expect(container).toBeDefined();
  });
});
