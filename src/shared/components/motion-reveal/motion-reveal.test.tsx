import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { MotionReveal } from "./motion-reveal";

beforeEach(() => {
  // Suppress framer-motion warnings in test environment
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MotionReveal", () => {
  it("renders children", () => {
    renderWithProviders(
      <MotionReveal>
        <p>Test content</p>
      </MotionReveal>,
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders as different element types", () => {
    const { container } = renderWithProviders(
      <MotionReveal as="section">
        <p>Content</p>
      </MotionReveal>,
    );

    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("applies data-motion-reveal attribute", () => {
    const { container } = renderWithProviders(
      <MotionReveal>
        <p>Content</p>
      </MotionReveal>,
    );

    expect(container.querySelector("[data-motion-reveal]")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <MotionReveal className="custom-class">
        <p>Content</p>
      </MotionReveal>,
    );

    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("renders as article element", () => {
    const { container } = renderWithProviders(
      <MotionReveal as="article">
        <p>Content</p>
      </MotionReveal>,
    );

    expect(container.querySelector("article")).toBeInTheDocument();
  });

  it("renders as nav element", () => {
    const { container } = renderWithProviders(
      <MotionReveal as="nav">
        <p>Content</p>
      </MotionReveal>,
    );

    expect(container.querySelector("nav")).toBeInTheDocument();
  });

  it("passes through additional HTML attributes", () => {
    renderWithProviders(
      <MotionReveal aria-label="Animated section" data-testid="motion-reveal">
        <p>Content</p>
      </MotionReveal>,
    );

    const element = screen.getByTestId("motion-reveal");
    expect(element).toHaveAttribute("aria-label", "Animated section");
  });

  it("renders with disabled animation", () => {
    renderWithProviders(
      <MotionReveal disabled>
        <p>Test content</p>
      </MotionReveal>,
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });
});
