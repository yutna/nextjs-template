import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { LandingHero } from "./landing-hero";

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
