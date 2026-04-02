import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { LandingCta } from "./landing-cta";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

describe("LandingCta", () => {
  it("renders the CTA section", async () => {
    renderWithProviders(await LandingCta({ locale: "en" }));
    expect(
      screen.getByTestId("static-pages-landing-cta-github-link"),
    ).toBeInTheDocument();
  });
});
