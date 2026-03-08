import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { WORKFLOW_STEPS } from "./constants";
import { LandingCliUsage } from "./landing-cli-usage";

vi.mock("server-only", () => ({}));

const mockGetTranslations = vi.hoisted(() =>
  vi.fn(() => (key: string) => key),
);

vi.mock("next-intl/server", () => ({
  getTranslations: mockGetTranslations,
}));

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));

describe("LandingCliUsage", () => {
  it("renders the section with translated heading", async () => {
    const { getByText } = renderWithProviders(
      await LandingCliUsage({ locale: "en" }),
    );

    expect(getByText("heading")).toBeInTheDocument();
    expect(getByText("subheading")).toBeInTheDocument();
  });

  it("renders all workflow steps", async () => {
    const { getByText } = renderWithProviders(
      await LandingCliUsage({ locale: "en" }),
    );

    for (const step of WORKFLOW_STEPS) {
      expect(getByText(`${step.key}Title`, { exact: false })).toBeInTheDocument();
      expect(getByText(`${step.key}Note`)).toBeInTheDocument();
    }
  });

  it("renders the dialog trigger button", async () => {
    const { getByText } = renderWithProviders(
      await LandingCliUsage({ locale: "en" }),
    );

    expect(getByText("openButton →")).toBeInTheDocument();
  });
});
