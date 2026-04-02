import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { MotionStagger } from "./motion-stagger";

beforeEach(() => {
  // Suppress framer-motion warnings in test environment
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MotionStagger", () => {
  it("renders all children", () => {
    renderWithProviders(
      <MotionStagger>
        <p>Item 1</p>
        <p>Item 2</p>
        <p>Item 3</p>
      </MotionStagger>,
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });

  it("renders as different container element", () => {
    const { container } = renderWithProviders(
      <MotionStagger as="ul">
        <span>Item 1</span>
        <span>Item 2</span>
      </MotionStagger>,
    );

    expect(container.querySelector("ul")).toBeInTheDocument();
  });

  it("applies data-motion-stagger attribute", () => {
    const { container } = renderWithProviders(
      <MotionStagger>
        <p>Item</p>
      </MotionStagger>,
    );

    expect(container.querySelector("[data-motion-stagger]")).toBeInTheDocument();
  });

  it("applies custom className to container", () => {
    const { container } = renderWithProviders(
      <MotionStagger className="stagger-container">
        <p>Item</p>
      </MotionStagger>,
    );

    expect(container.querySelector(".stagger-container")).toBeInTheDocument();
  });

  it("applies itemClassName to each item wrapper", () => {
    const { container } = renderWithProviders(
      <MotionStagger itemClassName="stagger-item">
        <p>Item 1</p>
        <p>Item 2</p>
      </MotionStagger>,
    );

    const items = container.querySelectorAll(".stagger-item");
    expect(items).toHaveLength(2);
  });

  it("renders item wrappers as different element", () => {
    const { container } = renderWithProviders(
      <MotionStagger as="ul" itemAs="li">
        <span>Item 1</span>
        <span>Item 2</span>
      </MotionStagger>,
    );

    const items = container.querySelectorAll("li");
    expect(items).toHaveLength(2);
  });

  it("renders with disabled animation", () => {
    renderWithProviders(
      <MotionStagger disabled>
        <p>Item 1</p>
        <p>Item 2</p>
      </MotionStagger>,
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });
});
