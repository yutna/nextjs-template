import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ScreenThemeSettings } from "./screen-theme-settings";

const mockContainerThemeSettings = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));
vi.mock("@/modules/theme-settings/containers/container-theme-settings", () => ({
  ContainerThemeSettings: (props: unknown) => {
    mockContainerThemeSettings(props);
    return null;
  },
}));

describe("ScreenThemeSettings", () => {
  it("passes locale to the theme settings container", async () => {
    const { container } = renderWithProviders(
      await ScreenThemeSettings({ locale: "en" }),
    );

    expect(container).toBeDefined();
    expect(mockContainerThemeSettings).toHaveBeenCalledWith({ locale: "en" });
  });
});
