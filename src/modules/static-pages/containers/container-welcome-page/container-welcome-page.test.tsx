import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ContainerWelcomePage } from "./container-welcome-page";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

// Mock all landing section components to isolate container
vi.mock("@/modules/static-pages/components/landing-ai-workflow", () => ({
  LandingAiWorkflow: () => null,
}));
vi.mock("@/modules/static-pages/components/landing-copilot", () => ({
  LandingCopilot: () => null,
}));
vi.mock("@/modules/static-pages/components/landing-cta", () => ({
  LandingCta: () => null,
}));
vi.mock("@/modules/static-pages/components/landing-footer", () => ({
  LandingFooter: () => null,
}));
vi.mock("@/modules/static-pages/components/landing-hero", () => ({
  LandingHero: () => null,
}));
vi.mock("@/modules/static-pages/components/landing-strengths", () => ({
  LandingStrengths: () => null,
}));
vi.mock("@/modules/static-pages/components/landing-tech-stack", () => ({
  LandingTechStack: () => null,
}));
vi.mock("@/modules/static-pages/components/page-chrome", () => ({
  PageChrome: () => null,
}));
vi.mock("@/shared/lib/navigation", () => ({
  usePathname: vi.fn(() => "/"),
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
}));

describe("ContainerWelcomePage", () => {
  it("renders without errors", async () => {
    const { container } = renderWithProviders(
      await ContainerWelcomePage({ locale: "en" }),
    );
    expect(container).toBeDefined();
  });
});
