import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { MotionText } from "./motion-text";

beforeEach(() => {
  // Suppress framer-motion warnings in test environment
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MotionText", () => {
  it("renders text content", () => {
    renderWithProviders(<MotionText>Hello World</MotionText>);

    expect(screen.getByText(/Hello/)).toBeInTheDocument();
    expect(screen.getByText(/World/)).toBeInTheDocument();
  });

  it("applies data-motion-text attribute", () => {
    const { container } = renderWithProviders(
      <MotionText>Test text</MotionText>,
    );

    expect(container.querySelector("[data-motion-text]")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <MotionText className="custom-text">Text</MotionText>,
    );

    expect(container.querySelector(".custom-text")).toBeInTheDocument();
  });

  it("renders as heading element", () => {
    const { container } = renderWithProviders(
      <MotionText as="h1">Heading Text</MotionText>,
    );

    expect(container.querySelector("h1")).toBeInTheDocument();
  });

  it("renders as paragraph element", () => {
    const { container } = renderWithProviders(
      <MotionText as="p">Paragraph text</MotionText>,
    );

    expect(container.querySelector("p")).toBeInTheDocument();
  });

  it("splits text by words by default", () => {
    const { container } = renderWithProviders(
      <MotionText>One Two Three</MotionText>,
    );

    // Words should be split into separate spans
    const spans = container.querySelectorAll("span");
    // Container + word spans + whitespace spans
    expect(spans.length).toBeGreaterThan(1);
  });

  it("splits text by characters when mode is characters", () => {
    const { container } = renderWithProviders(
      <MotionText mode="characters">ABC</MotionText>,
    );

    // Should have individual character spans
    const spans = container.querySelectorAll("span");
    expect(spans.length).toBeGreaterThan(1);
  });

  it("renders with disabled animation", () => {
    renderWithProviders(<MotionText disabled>Disabled text</MotionText>);

    expect(screen.getByText(/Disabled/)).toBeInTheDocument();
  });

  it("passes through additional HTML attributes", () => {
    renderWithProviders(
      <MotionText aria-label="Animated text" data-testid="motion-text">
        Text
      </MotionText>,
    );

    const element = screen.getByTestId("motion-text");
    expect(element).toHaveAttribute("aria-label", "Animated text");
  });
});
