import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ButtonGoBack } from "./button-go-back";

describe("ButtonGoBack", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a button with the provided label", () => {
    renderWithProviders(<ButtonGoBack label="Go Back" onClick={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Go Back" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    renderWithProviders(<ButtonGoBack label="Go Back" onClick={handleClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Go Back" }));

    expect(handleClick).toHaveBeenCalledOnce();
  });
});
