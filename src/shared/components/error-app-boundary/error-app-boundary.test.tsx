import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ErrorAppBoundary } from "./error-app-boundary";

import type { ReactNode } from "react";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));

const mockReportErrorAction = vi.hoisted(() => vi.fn());
vi.mock("@/shared/actions/report-error-action", () => ({
  reportErrorAction: mockReportErrorAction,
}));

vi.mock("@/shared/lib/navigation", () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/shared/routes", () => ({
  routes: { root: { path: () => "/" } },
}));

describe("ErrorAppBoundary", () => {
  const error = new Error("test error");
  const reset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders error heading, description, and action buttons", () => {
    renderWithProviders(<ErrorAppBoundary error={error} reset={reset} />);

    expect(screen.getByText("heading")).toBeInTheDocument();
    expect(screen.getByText("description")).toBeInTheDocument();
    expect(screen.getByText("goHome")).toBeInTheDocument();
    expect(screen.getByText("tryAgain")).toBeInTheDocument();
  });

  it("calls reportErrorAction on mount with error details", () => {
    renderWithProviders(<ErrorAppBoundary error={error} reset={reset} />);

    expect(mockReportErrorAction).toHaveBeenCalledWith({
      boundary: "app",
      digest: undefined,
      message: "test error",
    });
  });

  it("calls reset when clicking the try again button", () => {
    renderWithProviders(<ErrorAppBoundary error={error} reset={reset} />);

    fireEvent.click(screen.getByText("tryAgain"));

    expect(reset).toHaveBeenCalledOnce();
  });

  it("renders a link pointing to the home page", () => {
    renderWithProviders(<ErrorAppBoundary error={error} reset={reset} />);

    const link = screen.getByText("goHome").closest("a");
    expect(link).toHaveAttribute("href", "/");
  });
});
