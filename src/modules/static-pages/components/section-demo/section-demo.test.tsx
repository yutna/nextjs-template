import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));
vi.mock("@/shared/vendor/chakra-ui/color-mode", () => ({
  ColorModeButton: () => null,
}));

import { renderWithProviders } from "@/test/render-with-providers";

import { SectionDemo } from "./section-demo";

describe("SectionDemo", () => {
  it("renders the demoHeading translation key", async () => {
    renderWithProviders(await SectionDemo({ locale: "en" }));
    expect(screen.getByText("demoHeading")).toBeInTheDocument();
  });

  it("renders the demoSubheading translation key", async () => {
    renderWithProviders(await SectionDemo({ locale: "en" }));
    expect(screen.getByText("demoSubheading")).toBeInTheDocument();
  });

  it("passes demoCodeComment to DemoContent as the comment text", async () => {
    renderWithProviders(await SectionDemo({ locale: "en" }));
    expect(screen.getByText("demoCodeComment")).toBeInTheDocument();
  });

  it("renders inside a section element", async () => {
    renderWithProviders(await SectionDemo({ locale: "en" }));
    expect(document.querySelector("section")).toBeInTheDocument();
  });
});
