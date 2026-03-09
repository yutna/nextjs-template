import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ContainerLandingHero } from "./container-landing-hero";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));
vi.mock("@/modules/static-pages/containers/container-vibe-background", () => ({
  ContainerVibeBackground: () => null,
}));
vi.mock("@/modules/static-pages/containers/container-copy-command", () => ({
  ContainerCopyCommand: () => null,
}));
vi.mock("@/modules/static-pages/hooks/use-vibe", () => ({
  useVibe: () => ({
    isVibeOn: false,
    setVolume: vi.fn(),
    toggleVibe: vi.fn(),
    volume: 15,
  }),
}));

describe("ContainerLandingHero", () => {
  it("renders the hero section with translated content", async () => {
    const { container } = renderWithProviders(
      await ContainerLandingHero({ locale: "en" }),
    );
    expect(container).toBeDefined();
  });
});
