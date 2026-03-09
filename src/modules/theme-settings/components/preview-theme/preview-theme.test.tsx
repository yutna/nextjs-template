import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { PreviewTheme } from "./preview-theme";

describe("PreviewTheme", () => {
  it("renders the preview heading", () => {
    renderWithProviders(<PreviewTheme />);
    expect(screen.getByText("Theme Preview")).toBeInTheDocument();
  });

  it("renders button variants", () => {
    renderWithProviders(<PreviewTheme />);
    expect(screen.getByRole("button", { name: "Solid" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Outline" })).toBeInTheDocument();
  });

  it("renders an input field", () => {
    renderWithProviders(<PreviewTheme />);
    expect(screen.getByPlaceholderText("Type something…")).toBeInTheDocument();
  });
});
