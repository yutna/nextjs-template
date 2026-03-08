import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ContainerPageChrome } from "./container-page-chrome";

vi.mock("@/shared/lib/navigation", () => ({
  usePathname: vi.fn(() => "/"),
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
}));

vi.mock("@/modules/static-pages/containers/container-vibe-controls", () => ({
  ContainerVibeControls: () => null,
}));

describe("ContainerPageChrome", () => {
  it("renders locale buttons", () => {
    const { getByText } = renderWithProviders(
      <ContainerPageChrome locale="en" />,
    );
    expect(getByText("EN")).toBeDefined();
    expect(getByText("TH")).toBeDefined();
  });
});
