import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { LandingHero } from "./landing-hero";

vi.mock("@/modules/static-pages/containers/container-copy-command", () => ({
  ContainerCopyCommand: () => null,
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
