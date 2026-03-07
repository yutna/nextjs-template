import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { PageChrome } from "./page-chrome";

vi.mock("@/shared/lib/navigation", () => ({
  usePathname: vi.fn(() => "/"),
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
}));

vi.mock("server-only", () => ({}));

describe("PageChrome", () => {
  it("renders locale buttons and color mode toggle", () => {
    const { getByText } = renderWithProviders(<PageChrome locale="en" />);
    expect(getByText("TH")).toBeDefined();
    expect(getByText("EN")).toBeDefined();
  });
});
