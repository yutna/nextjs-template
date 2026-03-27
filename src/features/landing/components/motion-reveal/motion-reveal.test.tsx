import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { MotionReveal } from "./motion-reveal.client";

describe("MotionReveal", () => {
  it("renders children with the default variant", () => {
    renderWithProviders(
      <MotionReveal>
        <span>default content</span>
      </MotionReveal>,
    );
    expect(screen.getByText("default content")).toBeInTheDocument();
  });

  it("renders children with the fadeIn variant", () => {
    renderWithProviders(
      <MotionReveal variant="fadeIn">
        <span>fade in</span>
      </MotionReveal>,
    );
    expect(screen.getByText("fade in")).toBeInTheDocument();
  });

  it("renders children with the scaleIn variant", () => {
    renderWithProviders(
      <MotionReveal variant="scaleIn">
        <span>scale in</span>
      </MotionReveal>,
    );
    expect(screen.getByText("scale in")).toBeInTheDocument();
  });

  it("forwards className to the wrapper element", () => {
    const { container } = renderWithProviders(
      <MotionReveal className="custom-class">child</MotionReveal>,
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("accepts a delay prop without error", () => {
    renderWithProviders(
      <MotionReveal delay={0.5}>
        <span>delayed</span>
      </MotionReveal>,
    );
    expect(screen.getByText("delayed")).toBeInTheDocument();
  });
});
