import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { LandingHeroSection } from "./landing-hero-section";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));
vi.mock("@/features/landing/components/client/vibe-background.client", () => ({
  VibeBackgroundPanel: () => null,
}));
vi.mock("@/features/landing/components/client/copy-command.client", () => ({
  CopyCommandButton: () => null,
}));
vi.mock("@/features/landing/components/hooks/use-vibe", () => ({
  useVibe: () => ({
    isVibeOn: false,
    setVolume: vi.fn(),
    toggleVibe: vi.fn(),
    volume: 15,
  }),
}));

describe("LandingHeroSection", () => {
  it("renders the hero section with translated content", async () => {
    const { container } = renderWithProviders(
      await LandingHeroSection({ locale: "en" }),
    );
    expect(container).toBeDefined();
  });
});
