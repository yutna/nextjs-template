import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { PageChrome } from "./page-chrome";

describe("PageChrome", () => {
  it("renders locale buttons and color mode toggle", () => {
    const { getByText } = renderWithProviders(
      <PageChrome locale="en" onSwitchLocale={vi.fn()} />,
    );
    expect(getByText("TH")).toBeDefined();
    expect(getByText("EN")).toBeDefined();
  });
});
