import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ButtonGoBackClient } from "./button-go-back-client";

const mockBack = vi.hoisted(() => vi.fn());
vi.mock("@/shared/lib/navigation", () => ({
  useRouter: vi.fn(() => ({ back: mockBack })),
}));

describe("ButtonGoBackClient", () => {
  it("renders a button with the provided label", () => {
    renderWithProviders(<ButtonGoBackClient label="Go Back" />);
    expect(screen.getByRole("button", { name: "Go Back" })).toBeInTheDocument();
  });

  it("calls router.back when clicked", () => {
    renderWithProviders(<ButtonGoBackClient label="Go Back" />);
    fireEvent.click(screen.getByRole("button", { name: "Go Back" }));
    expect(mockBack).toHaveBeenCalledOnce();
  });
});
