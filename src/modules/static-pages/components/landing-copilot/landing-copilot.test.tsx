import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { LandingCopilot } from "./landing-copilot";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

describe("LandingCopilot", () => {
  it("renders the copilot features section", async () => {
    const { container } = renderWithProviders(await LandingCopilot({ locale: "en" }));
    expect(container).toBeDefined();
  });
});
