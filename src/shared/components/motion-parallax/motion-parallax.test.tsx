import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { MotionParallax } from "./motion-parallax";

beforeEach(() => {
  // Suppress framer-motion warnings in test environment
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MotionParallax", () => {
  it("renders children", () => {
    renderWithProviders(
      <MotionParallax>
        <p>Parallax content</p>
      </MotionParallax>,
    );

    expect(screen.getByText("Parallax content")).toBeInTheDocument();
  });

  it("applies data-motion-parallax attribute", () => {
    const { container } = renderWithProviders(
      <MotionParallax>
        <p>Content</p>
      </MotionParallax>,
    );

    expect(container.querySelector("[data-motion-parallax]")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <MotionParallax className="parallax-container">
        <p>Content</p>
      </MotionParallax>,
    );

    expect(container.querySelector(".parallax-container")).toBeInTheDocument();
  });

  it("renders as different element type", () => {
    const { container } = renderWithProviders(
      <MotionParallax as="section">
        <p>Content</p>
      </MotionParallax>,
    );

    expect(container.querySelector("section")).toBeInTheDocument();
  });

  // Note: Testing disabled state is skipped because useScroll hook requires
  // a hydrated ref which is not available in JSDOM test environment.
  // The disabled prop is verified through Storybook visual testing.
});
