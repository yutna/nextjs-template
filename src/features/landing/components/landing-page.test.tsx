import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { LandingPage } from "./landing-page";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

vi.mock("@/features/landing/components/landing-hero-section", () => ({
  LandingHeroSection: () => null,
}));
vi.mock("@/features/landing/components/landing-ai-workflow", () => ({
  LandingAiWorkflow: () => null,
}));
vi.mock("@/features/landing/components/landing-copilot", () => ({
  LandingCopilot: () => null,
}));
vi.mock("@/features/landing/components/landing-cta", () => ({
  LandingCta: () => null,
}));
vi.mock("@/features/landing/components/landing-footer", () => ({
  LandingFooter: () => null,
}));
vi.mock("@/features/landing/components/landing-cli-usage", () => ({
  LandingCliUsage: () => null,
}));
vi.mock("@/features/landing/components/landing-strengths", () => ({
  LandingStrengths: () => null,
}));
vi.mock("@/features/landing/components/landing-tech-stack", () => ({
  LandingTechStack: () => null,
}));
vi.mock("@/features/landing/components/client/page-chrome.client", () => ({
  PageChromeClient: () => null,
}));

describe("LandingPage", () => {
  it("renders without errors", async () => {
    const { container } = renderWithProviders(
      await LandingPage({ locale: "en" }),
    );
    expect(container).toBeDefined();
  });
});
