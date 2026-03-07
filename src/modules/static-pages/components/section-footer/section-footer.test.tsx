import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

import { renderWithProviders } from "@/test/render-with-providers";

import { SectionFooter } from "./section-footer";

describe("SectionFooter", () => {
  it("renders a footer landmark", async () => {
    renderWithProviders(await SectionFooter({ locale: "en" }));
    expect(document.querySelector("footer")).toBeInTheDocument();
  });

  it("renders the copyright translation key", async () => {
    renderWithProviders(await SectionFooter({ locale: "en" }));
    expect(screen.getByText("copyright")).toBeInTheDocument();
  });

  it("renders the builtWith translation key", async () => {
    renderWithProviders(await SectionFooter({ locale: "en" }));
    expect(screen.getByText("builtWith")).toBeInTheDocument();
  });
});
