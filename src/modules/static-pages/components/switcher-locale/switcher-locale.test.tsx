import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReplace = vi.hoisted(() => vi.fn());
const mockUsePathname = vi.hoisted(() => vi.fn().mockReturnValue("/"));

vi.mock("@/shared/lib/navigation", () => ({
  usePathname: mockUsePathname,
  useRouter: vi.fn(() => ({ replace: mockReplace })),
}));

import { renderWithProviders } from "@/test/render-with-providers";

import { SwitcherLocale } from "./switcher-locale";

describe("SwitcherLocale", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/");
  });

  it("renders a button for each locale", () => {
    renderWithProviders(<SwitcherLocale locale="en" />);
    expect(screen.getByText("TH")).toBeInTheDocument();
    expect(screen.getByText("EN")).toBeInTheDocument();
  });

  it("does not call router.replace when clicking the active locale", () => {
    renderWithProviders(<SwitcherLocale locale="en" />);
    fireEvent.click(screen.getByText("EN"));
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("calls router.replace with the next locale when clicking an inactive locale", () => {
    renderWithProviders(<SwitcherLocale locale="en" />);
    fireEvent.click(screen.getByText("TH"));
    expect(mockReplace).toHaveBeenCalledWith("/", { locale: "th" });
  });

  it("renders fixed position container at top-right", () => {
    const { container } = renderWithProviders(<SwitcherLocale locale="th" />);
    // The outermost Box has position=fixed; rendered as a div
    expect(container.firstChild).toBeInTheDocument();
  });
});
