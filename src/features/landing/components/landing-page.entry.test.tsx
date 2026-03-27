import { describe, expect, it, vi } from "vitest";

import Page from "@/app/[locale]/page";
import { renderWithProviders } from "@/test/render-with-providers";

const { setRequestLocale } = vi.hoisted(() => ({
  setRequestLocale: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("next-intl/server", () => ({
  setRequestLocale,
}));
vi.mock("react", () => ({
  use: () => ({ locale: "en" }),
}));
vi.mock("@/features/landing", () => ({
  LandingPage: () => null,
}));

describe("Page route shell", () => {
  it("renders without errors", async () => {
    const { container } = renderWithProviders(
      Page({ params: Promise.resolve({ locale: "en" }) }),
    );
    expect(container).toBeDefined();
    expect(setRequestLocale).toHaveBeenCalledWith("en");
  });
});
