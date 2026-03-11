import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ScreenReferencePatternsHub } from "./screen-reference-patterns-hub";

vi.mock("server-only", () => ({}));
vi.mock(
  "@/modules/reference-patterns/containers/container-reference-patterns-hub",
  () => ({
    ContainerReferencePatternsHub: () => null,
  }),
);

describe("ScreenReferencePatternsHub", () => {
  it("renders without errors", async () => {
    const { container } = renderWithProviders(
      await ScreenReferencePatternsHub({ locale: "en" }),
    );

    expect(container).toBeDefined();
  });
});
