import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { VibeControlsPanel } from "./vibe-controls.client";

vi.mock("@/features/landing/components/hooks/use-vibe-controls", () => ({
  useVibeControls: vi.fn(() => ({
    handleChangeVolume: vi.fn(),
    handleToggleVibe: vi.fn(),
    isDesktop: false,
    isVibeOn: true,
    volume: 15,
  })),
}));

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      matches: false,
      removeEventListener: vi.fn(),
    }),
  });
});

describe("VibeControlsPanel", () => {
  it("renders nothing on mobile (default SSR state)", () => {
    const { container } = renderWithProviders(<VibeControlsPanel />);

    expect(container.firstChild).toBeNull();
  });
});
