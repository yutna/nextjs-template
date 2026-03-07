import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { LandingFooter } from "./landing-footer";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

describe("LandingFooter", () => {
  it("renders the footer", async () => {
    const { container } = renderWithProviders(
      await LandingFooter({ locale: "en" }),
    );
    expect(container).toBeDefined();
  });
});
