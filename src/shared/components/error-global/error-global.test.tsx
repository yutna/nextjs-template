import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ErrorGlobal } from "./error-global";

import type { ReactNode } from "react";

const mockReportErrorAction = vi.hoisted(() => vi.fn());
vi.mock("@/shared/actions/report-error-action", () => ({
  reportErrorAction: mockReportErrorAction,
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/shared/routes", () => ({
  routes: { root: { path: () => "/" } },
}));

describe("ErrorGlobal", () => {
  const error = new Error("critical failure");
  const reset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the 500 error page with heading and description", () => {
    renderWithProviders(<ErrorGlobal error={error} reset={reset} />);

    expect(screen.getByText("500")).toBeInTheDocument();
    expect(screen.getByText("Something Went Wrong")).toBeInTheDocument();
    expect(
      screen.getByText(
        "A critical error occurred. Please try again or refresh the page.",
      ),
    ).toBeInTheDocument();
  });

  it("calls reportErrorAction on mount with global boundary details", () => {
    renderWithProviders(<ErrorGlobal error={error} reset={reset} />);

    expect(mockReportErrorAction).toHaveBeenCalledWith({
      boundary: "global",
      digest: undefined,
      message: "critical failure",
    });
  });

  it("renders action buttons for navigation and retry", () => {
    renderWithProviders(<ErrorGlobal error={error} reset={reset} />);

    expect(screen.getByText("⌂ Back to Home")).toBeInTheDocument();
    expect(screen.getByText("↺ Try Again")).toBeInTheDocument();
  });

  it("renders a link pointing to the home page", () => {
    renderWithProviders(<ErrorGlobal error={error} reset={reset} />);

    const link = screen.getByText("⌂ Back to Home").closest("a");
    expect(link).toHaveAttribute("href", "/");
  });
});
