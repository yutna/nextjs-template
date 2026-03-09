import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { CardThemePreset } from "./card-theme-preset";

import type { ThemePreset } from "@/modules/theme-settings/types";

const mockPreset: ThemePreset = {
  cssVars: { dark: {}, light: {} },
  description: "A test preset",
  id: "cyberpunk",
  name: "Cyberpunk UI",
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

    await user.click(screen.getByText("Cyberpunk UI"));
    expect(handleClickSelect).toHaveBeenCalledWith(mockPreset);
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
