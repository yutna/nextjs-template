import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { MotionScroll } from "./motion-scroll";

beforeEach(() => {
  // Suppress framer-motion warnings in test environment
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MotionScroll", () => {
  it("renders children", () => {
    renderWithProviders(
      <MotionScroll>
        <p>Scroll content</p>
      </MotionScroll>,
    );

    expect(screen.getByText("Scroll content")).toBeInTheDocument();
  });

  it("applies data-motion-scroll attribute", () => {
    const { container } = renderWithProviders(
      <MotionScroll>
        <p>Content</p>
      </MotionScroll>,
    );

    expect(container.querySelector("[data-motion-scroll]")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <MotionScroll className="scroll-container">
        <p>Content</p>
      </MotionScroll>,
    );

    expect(container.querySelector(".scroll-container")).toBeInTheDocument();
  });

  it("renders as different element type", () => {
    const { container } = renderWithProviders(
      <MotionScroll as="section">
        <p>Content</p>
      </MotionScroll>,
    );

    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("renders with render prop children", () => {
    renderWithProviders(
      <MotionScroll>
        {({ progress }) => <p>Progress: {progress}</p>}
      </MotionScroll>,
    );

    expect(screen.getByText(/Progress:/)).toBeInTheDocument();
  });

  // Note: Testing disabled state is skipped because useScroll hook requires
  // a hydrated ref which is not available in JSDOM test environment.
  // The disabled prop is verified through Storybook visual testing.
});
