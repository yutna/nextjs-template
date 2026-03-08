import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ContainerVibeBackground } from "./container-vibe-background";

vi.mock("@/modules/static-pages/hooks/use-vibe", () => ({
  useVibe: vi.fn(() => ({
    isVibeOn: true,
    setVolume: vi.fn(),
    toggleVibe: vi.fn(),
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

describe("ContainerVibeBackground", () => {
  it("renders nothing on mobile (default SSR state)", () => {
    const { container } = renderWithProviders(<ContainerVibeBackground />);

    expect(container.firstChild).toBeNull();
  });
});
