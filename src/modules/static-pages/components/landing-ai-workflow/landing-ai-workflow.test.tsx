import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { LandingAiWorkflow } from "./landing-ai-workflow";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

describe("LandingAiWorkflow", () => {
  it("renders the workflow section", async () => {
    const { container } = renderWithProviders(await LandingAiWorkflow({ locale: "en" }));
    expect(container).toBeDefined();
  });
});
