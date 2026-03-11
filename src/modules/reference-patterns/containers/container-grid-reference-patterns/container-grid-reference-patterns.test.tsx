import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ContainerGridReferencePatterns } from "./container-grid-reference-patterns";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

describe("ContainerGridReferencePatterns", () => {
  it("renders without errors", async () => {
    const { container } = renderWithProviders(
      await ContainerGridReferencePatterns({ locale: "en" }),
    );

    expect(container).toBeDefined();
  });
});
