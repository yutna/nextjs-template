import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { MotionStagger } from "./motion-stagger.client";

describe("MotionStagger", () => {
  it("renders children", () => {
    renderWithProviders(
      <MotionStagger>
        <span>stagger child</span>
      </MotionStagger>,
    );
    expect(screen.getByText("stagger child")).toBeInTheDocument();
  });

  it("accepts a custom staggerDelay without error", () => {
    renderWithProviders(
      <MotionStagger staggerDelay={0.2}>
        <span>child</span>
      </MotionStagger>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("forwards className to the wrapper element", () => {
    const { container } = renderWithProviders(
      <MotionStagger className="stagger-wrapper">
        <span>item</span>
      </MotionStagger>,
    );
    expect(container.querySelector(".stagger-wrapper")).toBeInTheDocument();
  });
});
