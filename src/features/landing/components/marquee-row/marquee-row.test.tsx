import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { MarqueeRow } from "./marquee-row.client";

describe("MarqueeRow", () => {
  it("duplicates children for the infinite scroll effect", () => {
    renderWithProviders(
      <MarqueeRow>
        <span data-testid="item">Tech</span>
      </MarqueeRow>,
    );
    // The component renders {children}{children} to create the loop
    expect(screen.getAllByTestId("item")).toHaveLength(2);
  });

  it("accepts a custom duration without error", () => {
    renderWithProviders(
      <MarqueeRow duration={60}>
        <span>item</span>
      </MarqueeRow>,
    );
    expect(screen.getAllByText("item")).toHaveLength(2);
  });

  it("renders with no children", () => {
    const { container } = renderWithProviders(<MarqueeRow />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
