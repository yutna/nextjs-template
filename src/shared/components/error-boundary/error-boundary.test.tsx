import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ErrorBoundary } from "./error-boundary";

function ThrowingChild(): never {
  throw new Error("boom");
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when no error occurs", () => {
    renderWithProviders(
      <ErrorBoundary>
        <p>safe content</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText("safe content")).toBeInTheDocument();
  });

  it("renders the fallback UI when a child throws", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderWithProviders(
      <ErrorBoundary renderFallback={({ error }) => <p>caught: {error.message}</p>}>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText("caught: boom")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("renders nothing when a child throws and no fallback is provided", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { container } = renderWithProviders(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    expect(container.innerHTML).toBe("");

    consoleSpy.mockRestore();
  });

  it("resets the error state and re-renders children when reset is called", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    let shouldThrow = true;

    function ConditionalChild() {
      if (shouldThrow) {
        throw new Error("boom");
      }
      return <p>recovered</p>;
    }

    renderWithProviders(
      <ErrorBoundary
        renderFallback={({ reset }) => <button onClick={reset}>retry</button>}
      >
        <ConditionalChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText("retry")).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByText("retry"));

    expect(screen.getByText("recovered")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
