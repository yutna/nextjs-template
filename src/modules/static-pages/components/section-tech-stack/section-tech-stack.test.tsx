import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

import { renderWithProviders } from "@/test/render-with-providers";

import { TECH_STACK } from "./constants";
import { SectionTechStack } from "./section-tech-stack";

describe("SectionTechStack", () => {
  it("renders every tech name from TECH_STACK", async () => {
    renderWithProviders(await SectionTechStack({ locale: "en" }));
    for (const tech of TECH_STACK) {
      // MarqueeRow duplicates children, so each name appears at least once
      expect(screen.getAllByText(tech.name).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("renders the section heading and subheading translation keys", async () => {
    renderWithProviders(await SectionTechStack({ locale: "en" }));
    expect(screen.getByText("heading")).toBeInTheDocument();
    expect(screen.getByText("subheading")).toBeInTheDocument();
  });

  it("TECH_STACK contains the expected core technologies", () => {
    const names = TECH_STACK.map((t) => t.name);
    expect(names).toContain("Next.js");
    expect(names).toContain("React");
    expect(names).toContain("TypeScript");
    expect(names).toContain("Chakra UI");
  });
});
