import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { PageChromeClient } from "./page-chrome.client";

vi.mock("@/features/landing/components/hooks/use-page-chrome", () => ({
  usePageChrome: () => ({
    handleSwitchLocale: vi.fn(),
  }),
}));

vi.mock("@/features/landing/components/client/vibe-controls.client", () => ({
  VibeControlsPanel: () => null,
}));

describe("PageChromeClient", () => {
  it("renders locale buttons", () => {
    const { getByText } = renderWithProviders(
      <PageChromeClient locale="en" />,
    );
    expect(getByText("EN")).toBeDefined();
    expect(getByText("TH")).toBeDefined();
  });
});
