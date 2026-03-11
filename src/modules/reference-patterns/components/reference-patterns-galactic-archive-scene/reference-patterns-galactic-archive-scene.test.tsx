import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

const mockCanvas = vi.hoisted(() =>
  vi.fn(() => <div data-testid="galactic-archive-scene" />),
);

vi.mock("@react-three/fiber", () => ({
  Canvas: mockCanvas,
  useFrame: vi.fn(),
}));
vi.mock("motion/react", () => ({
  useReducedMotion: () => false,
}));

import { ReferencePatternsGalacticArchiveScene } from "./reference-patterns-galactic-archive-scene";

describe("ReferencePatternsGalacticArchiveScene", () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      getExtension: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  it("renders the scene shell through the canvas boundary", async () => {
    renderWithProviders(<ReferencePatternsGalacticArchiveScene side="dark" />);

    await waitFor(() => {
      expect(screen.getByTestId("galactic-archive-scene")).toBeInTheDocument();
    });
    expect(mockCanvas).toHaveBeenCalledWith(
      expect.objectContaining({
        camera: { fov: 50, position: [0, 0, 1.8] },
        dpr: [1, 1.5],
      }),
      undefined,
    );
  });
});
