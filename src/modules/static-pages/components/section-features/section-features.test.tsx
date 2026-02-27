import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

import { renderWithProviders } from "@/test/render-with-providers";

import { FEATURE_COLORS, FEATURE_ICONS } from "./constants";
import { SectionFeatures } from "./section-features";

describe("SectionFeatures", () => {
  it("renders all 6 feature title keys", async () => {
    renderWithProviders(await SectionFeatures({ locale: "en" }));
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByText(`feature${i}Title`)).toBeInTheDocument();
    }
  });

  it("renders all 6 feature description keys", async () => {
    renderWithProviders(await SectionFeatures({ locale: "en" }));
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByText(`feature${i}Desc`)).toBeInTheDocument();
    }
  });

  it("FEATURE_ICONS has 6 entries", () => {
    expect(FEATURE_ICONS).toHaveLength(6);
  });

  it("FEATURE_COLORS has 6 entries matching FEATURE_ICONS length", () => {
    expect(FEATURE_COLORS).toHaveLength(FEATURE_ICONS.length);
  });
});
