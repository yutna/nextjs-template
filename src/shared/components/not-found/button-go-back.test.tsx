import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ButtonGoBack } from "./button-go-back";

const mockBack = vi.hoisted(() => vi.fn());
vi.mock("@/shared/lib/navigation", () => ({
  useRouter: vi.fn(() => ({ back: mockBack })),
}));

describe("ButtonGoBack", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a button with the provided label", () => {
    renderWithProviders(<ButtonGoBack label="Go Back" />);

    expect(screen.getByRole("button", { name: "Go Back" })).toBeInTheDocument();
  });

  it("calls router.back when clicked", () => {
    renderWithProviders(<ButtonGoBack label="Go Back" />);

    fireEvent.click(screen.getByRole("button", { name: "Go Back" }));

    expect(mockBack).toHaveBeenCalledOnce();
  });
});
