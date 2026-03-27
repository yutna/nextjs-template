import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { LandingTechStack } from "./landing-tech-stack";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

describe("LandingTechStack", () => {
  it("renders the tech stack section", async () => {
    const { container } = renderWithProviders(
      await LandingTechStack({ locale: "en" }),
    );
    expect(container).toBeDefined();
  });
});
