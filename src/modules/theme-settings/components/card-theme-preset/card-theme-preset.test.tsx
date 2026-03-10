import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { CardThemePreset } from "./card-theme-preset";

import type { ThemePreset } from "@/modules/theme-settings/types";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn((namespace: string) => (key: string) => {
    const translations: Record<string, string> = {
      "modules.themeSettings.presets.cyberpunk.description": "A test preset",
      "modules.themeSettings.presets.cyberpunk.name": "Cyberpunk UI",
    };

    const messageKey = `${namespace}.${key}`;
    return translations[messageKey] ?? messageKey;
  }),
}));

const mockPreset: ThemePreset = {
  cssVars: { dark: {}, light: {} },
  id: "cyberpunk",
  swatches: ["#FF007F", "#BD00FF", "#00FFFF"],
};

describe("CardThemePreset", () => {
  it("renders preset name and description", () => {
    renderWithProviders(
      <CardThemePreset
        isActive={false}
        onClickSelect={vi.fn()}
        preset={mockPreset}
      />,
    );

    expect(screen.getByText("Cyberpunk UI")).toBeInTheDocument();
    expect(screen.getByText("A test preset")).toBeInTheDocument();
  });

  it("calls onClickSelect when clicked", async () => {
    const user = userEvent.setup();
    const handleClickSelect = vi.fn();

    renderWithProviders(
      <CardThemePreset
        isActive={false}
        onClickSelect={handleClickSelect}
        preset={mockPreset}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Cyberpunk UI/i }));
    expect(handleClickSelect).toHaveBeenCalledWith(mockPreset);
  });

  it("exposes pressed state for assistive technology", () => {
    renderWithProviders(
      <CardThemePreset isActive onClickSelect={vi.fn()} preset={mockPreset} />,
    );

    expect(screen.getByRole("button", { name: /Cyberpunk UI/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("renders swatches", () => {
    renderWithProviders(
      <CardThemePreset
        isActive={false}
        onClickSelect={vi.fn()}
        preset={mockPreset}
      />,
    );

    // 3 swatch boxes rendered (aria-hidden)
    const swatchBoxes = document.querySelectorAll("[aria-hidden]");
    expect(swatchBoxes.length).toBe(3);
  });
});
