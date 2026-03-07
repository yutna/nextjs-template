import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { LandingHero } from "./landing-hero";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

describe("LandingHero", () => {
  it("renders the hero section", async () => {
    const { container } = renderWithProviders(await LandingHero({ locale: "en" }));
    expect(container).toBeDefined();
  });
});
