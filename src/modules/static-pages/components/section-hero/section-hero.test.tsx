import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

import { renderWithProviders } from "@/test/render-with-providers";

import { SectionHero } from "./section-hero";

describe("SectionHero", () => {
  it("renders a section landmark", async () => {
    renderWithProviders(await SectionHero({ locale: "en" }));
    expect(document.querySelector("section")).toBeInTheDocument();
  });

  it("renders the title translation key", async () => {
    renderWithProviders(await SectionHero({ locale: "en" }));
    expect(screen.getByText("title")).toBeInTheDocument();
  });

  it("renders the subtitle translation key", async () => {
    renderWithProviders(await SectionHero({ locale: "en" }));
    expect(screen.getByText("subtitle")).toBeInTheDocument();
  });

  it("renders with Thai locale without error", async () => {
    renderWithProviders(await SectionHero({ locale: "th" }));
    expect(document.querySelector("section")).toBeInTheDocument();
  });
});
