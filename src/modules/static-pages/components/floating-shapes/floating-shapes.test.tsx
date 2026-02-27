import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { FLOATING_SHAPES } from "./constants";
import { FloatingShapes } from "./floating-shapes";

describe("FloatingShapes", () => {
  it("has aria-hidden on the root element", () => {
    const { container } = renderWithProviders(<FloatingShapes />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("renders exactly FLOATING_SHAPES.length motion wrappers", () => {
    const { container } = renderWithProviders(<FloatingShapes />);
    const root = container.firstChild as HTMLElement;
    expect(root.children).toHaveLength(FLOATING_SHAPES.length);
  });
});
