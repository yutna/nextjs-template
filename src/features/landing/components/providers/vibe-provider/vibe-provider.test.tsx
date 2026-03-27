import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { VibeProvider } from "./vibe-provider.client";

describe("VibeProvider", () => {
  it("renders children", () => {
    const { getByText } = renderWithProviders(
      <VibeProvider>
        <span>child content</span>
      </VibeProvider>,
    );
    expect(getByText("child content")).toBeDefined();
  });
});
