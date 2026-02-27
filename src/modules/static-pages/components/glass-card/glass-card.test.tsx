import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { GlassCard } from "./glass-card";

describe("GlassCard", () => {
  it("renders children", () => {
    renderWithProviders(<GlassCard>Hello Card</GlassCard>);
    expect(screen.getByText("Hello Card")).toBeInTheDocument();
  });

  it("forwards extra BoxProps to the root element", () => {
    renderWithProviders(<GlassCard data-testid="my-card">content</GlassCard>);
    expect(screen.getByTestId("my-card")).toBeInTheDocument();
  });

  it("renders with no children", () => {
    const { container } = renderWithProviders(<GlassCard />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
