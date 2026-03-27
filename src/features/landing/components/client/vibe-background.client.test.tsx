import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { VibeBackgroundPanel } from "./vibe-background.client";

vi.mock("@/features/landing/components/hooks/use-vibe-background", () => ({
  useVibeBackground: vi.fn(() => ({
    handleLoadIframe: vi.fn(),
    iframeRef: { current: null },
    isDesktop: false,
    isVibeOn: true,
  })),
}));

describe("VibeBackgroundPanel", () => {
  it("renders nothing on mobile (default SSR state)", () => {
    const { container } = renderWithProviders(<VibeBackgroundPanel />);

    expect(container.firstChild).toBeNull();
  });
});
