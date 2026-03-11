import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ScreenReferencePatternsGalacticArchive } from "./screen-reference-patterns-galactic-archive";

vi.mock("server-only", () => ({}));
vi.mock(
  "@/modules/reference-patterns/containers/container-reference-patterns-galactic-archive",
  () => ({
    ContainerReferencePatternsGalacticArchive: () => null,
  }),
);

describe("ScreenReferencePatternsGalacticArchive", () => {
  it("renders without errors", async () => {
    const { container } = renderWithProviders(
      await ScreenReferencePatternsGalacticArchive({
        initialSearchQuery: "",
        locale: "en",
        requestedSide: null,
      }),
    );

    expect(container).toBeDefined();
  });
});
