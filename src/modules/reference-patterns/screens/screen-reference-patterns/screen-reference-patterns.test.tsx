import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ScreenReferencePatterns } from "./screen-reference-patterns";

vi.mock("server-only", () => ({}));
vi.mock(
  "@/modules/reference-patterns/containers/container-form-reference-note",
  () => ({
    ContainerFormReferenceNote: () => null,
  }),
);
vi.mock(
  "@/modules/reference-patterns/containers/container-grid-reference-patterns",
  () => ({
    ContainerGridReferencePatterns: () => null,
  }),
);

describe("ScreenReferencePatterns", () => {
  it("renders without errors", async () => {
    const { container } = renderWithProviders(
      await ScreenReferencePatterns({ locale: "en" }),
    );

    expect(container).toBeDefined();
  });
});
