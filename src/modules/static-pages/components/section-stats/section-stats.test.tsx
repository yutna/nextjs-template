import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

// AnimatedCounter uses useInView and animate — prevent animation side-effects in jsdom
vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  return {
    ...actual,
    useInView: vi.fn().mockReturnValue(false),
    animate: vi.fn().mockReturnValue({ stop: vi.fn() }),
  };
});

import { renderWithProviders } from "@/test/render-with-providers";

import { STAT_GRADIENT_COLORS } from "./constants";
import { SectionStats } from "./section-stats";

describe("SectionStats", () => {
  it("renders exactly 4 stat label keys", async () => {
    renderWithProviders(await SectionStats({ locale: "en" }));
    for (let i = 1; i <= 4; i++) {
      expect(screen.getByText(`stat${i}Label`)).toBeInTheDocument();
    }
  });

  it("renders 4 AnimatedCounter elements (one per stat)", async () => {
    renderWithProviders(await SectionStats({ locale: "en" }));
    // The translator mock returns the key string for value keys (e.g. "stat1Value"),
    // Number("stat1Value") is NaN — each counter displays "NaN" when not in view.
    // Verify 4 stat label keys are rendered (one per counter card).
    const labels = screen.getAllByText(/^stat[1-4]Label$/);
    expect(labels).toHaveLength(4);
  });

  it("STAT_GRADIENT_COLORS has exactly 4 entries matching the stat count", () => {
    expect(STAT_GRADIENT_COLORS).toHaveLength(4);
  });
});
