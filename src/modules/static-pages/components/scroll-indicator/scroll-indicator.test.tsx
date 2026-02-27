import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ScrollIndicator } from "./scroll-indicator";

describe("ScrollIndicator", () => {
  it("mounts without error", () => {
    const { container } = renderWithProviders(<ScrollIndicator />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders an SVG chevron icon", () => {
    const { container } = renderWithProviders(<ScrollIndicator />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
