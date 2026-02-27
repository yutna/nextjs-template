import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { GRADIENT_MESH_BLOBS } from "./constants";
import { GradientMesh } from "./gradient-mesh";

describe("GradientMesh", () => {
  it("has aria-hidden on the root element", () => {
    const { container } = renderWithProviders(<GradientMesh />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("renders exactly GRADIENT_MESH_BLOBS.length motion wrappers", () => {
    const { container } = renderWithProviders(<GradientMesh />);
    const root = container.firstChild as HTMLElement;
    expect(root.children).toHaveLength(GRADIENT_MESH_BLOBS.length);
  });
});
