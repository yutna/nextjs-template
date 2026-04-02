import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { LandingHero } from "./landing-hero";

describe("LandingHero", () => {
  it("renders the hero content with translated strings", () => {
    renderWithProviders(
      <LandingHero
        getStarted="Get started"
        subtitle="Build something great"
        title="Vibe Code"
      />,
    );
    expect(screen.getByText("Vibe Code")).toBeInTheDocument();
    expect(screen.getByText("Get started")).toBeInTheDocument();
  });

  it("renders GitHub button and link with correct data-testid", () => {
    renderWithProviders(
      <LandingHero
        getStarted="Get started"
        subtitle="Build something great"
        title="Vibe Code"
      />,
    );
    expect(
      screen.getByTestId("static-pages-landing-hero-github-link"),
    ).toBeInTheDocument();
  });
});
