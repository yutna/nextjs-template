import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ContainerVibeBackground } from "./container-vibe-background";

vi.mock("@/modules/static-pages/hooks/use-vibe-background", () => ({
  useVibeBackground: vi.fn(() => ({
    iframeRef: { current: null },
    isDesktop: false,
    isVibeOn: true,
    onIframeLoad: vi.fn(),
  })),
}));

describe("ContainerVibeBackground", () => {
  it("renders nothing on mobile (default SSR state)", () => {
    const { container } = renderWithProviders(<ContainerVibeBackground />);

    expect(container.firstChild).toBeNull();
  });
});
