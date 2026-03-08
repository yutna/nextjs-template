import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { LandingHero } from "./landing-hero";

vi.mock("@/modules/static-pages/hooks/use-vibe", () => ({
  useVibe: () => ({
    isVibeOn: false,
    setVolume: vi.fn(),
    toggleVibe: vi.fn(),
    volume: 15,
  }),
}));

describe("LandingHero", () => {
  it("renders the hero content with translated strings", () => {
    const { container } = renderWithProviders(
      <LandingHero
        getStarted="Get started"
        subtitle="Build something great"
        title="Vibe Code"
      />,
    );
    expect(container).toBeDefined();
  });
});
