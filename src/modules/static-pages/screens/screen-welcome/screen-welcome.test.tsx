import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/modules/static-pages/components/switcher-locale", () => ({
  SwitcherLocale: () => <div data-testid="switcher-locale" />,
}));
vi.mock("@/modules/static-pages/components/gradient-mesh", () => ({
  GradientMesh: () => <div data-testid="gradient-mesh" />,
}));
vi.mock("@/modules/static-pages/components/section-hero", () => ({
  SectionHero: () => <div data-testid="section-hero" />,
}));
vi.mock("@/modules/static-pages/components/section-features", () => ({
  SectionFeatures: () => <div data-testid="section-features" />,
}));
vi.mock("@/modules/static-pages/components/section-tech-stack", () => ({
  SectionTechStack: () => <div data-testid="section-tech-stack" />,
}));
vi.mock("@/modules/static-pages/components/section-stats", () => ({
  SectionStats: () => <div data-testid="section-stats" />,
}));
vi.mock("@/modules/static-pages/components/section-demo", () => ({
  SectionDemo: () => <div data-testid="section-demo" />,
}));
vi.mock("@/modules/static-pages/components/section-footer", () => ({
  SectionFooter: () => <div data-testid="section-footer" />,
}));

import { renderWithProviders } from "@/test/render-with-providers";

import { ScreenWelcome } from "./screen-welcome";

describe("ScreenWelcome", () => {
  it("renders a main landmark as the root element", async () => {
    renderWithProviders(await ScreenWelcome({ locale: "en" }));
    expect(document.querySelector("main")).toBeInTheDocument();
  });

  it("renders all 8 sub-components", async () => {
    renderWithProviders(await ScreenWelcome({ locale: "en" }));
    expect(screen.getByTestId("switcher-locale")).toBeInTheDocument();
    expect(screen.getByTestId("gradient-mesh")).toBeInTheDocument();
    expect(screen.getByTestId("section-hero")).toBeInTheDocument();
    expect(screen.getByTestId("section-features")).toBeInTheDocument();
    expect(screen.getByTestId("section-tech-stack")).toBeInTheDocument();
    expect(screen.getByTestId("section-stats")).toBeInTheDocument();
    expect(screen.getByTestId("section-demo")).toBeInTheDocument();
    expect(screen.getByTestId("section-footer")).toBeInTheDocument();
  });

  it("renders with Thai locale without error", async () => {
    renderWithProviders(await ScreenWelcome({ locale: "th" }));
    expect(document.querySelector("main")).toBeInTheDocument();
  });
});
