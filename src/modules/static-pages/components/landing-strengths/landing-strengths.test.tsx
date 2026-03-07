import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { LandingStrengths } from "./landing-strengths";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

describe("LandingStrengths", () => {
  it("renders the strengths section", async () => {
    const { container } = renderWithProviders(await LandingStrengths({ locale: "en" }));
    expect(container).toBeDefined();
  });
});
