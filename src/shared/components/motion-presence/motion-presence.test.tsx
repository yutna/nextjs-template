import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { MotionPresence } from "./motion-presence";

beforeEach(() => {
  // Suppress framer-motion warnings in test environment
  vi.spyOn(console, "warn").mockImplementation(() => {});
  // Suppress React key warnings for AnimatePresence children
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MotionPresence", () => {
  it("renders children", () => {
    renderWithProviders(
      <MotionPresence>
        <p>Content</p>
      </MotionPresence>,
    );

    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    renderWithProviders(
      <MotionPresence>
        <p>First</p>
        <p>Second</p>
      </MotionPresence>,
    );

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("renders conditional children when true", () => {
    const isVisible = true;

    renderWithProviders(
      <MotionPresence>
        {isVisible && <p>Visible content</p>}
      </MotionPresence>,
    );

    expect(screen.getByText("Visible content")).toBeInTheDocument();
  });

  it("does not render conditional children when false", () => {
    const isVisible = false;

    renderWithProviders(
      <MotionPresence>
        {isVisible && <p>Hidden content</p>}
      </MotionPresence>,
    );

    expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();
  });

  it("renders with wait mode", () => {
    renderWithProviders(
      <MotionPresence mode="wait">
        <p key="content">Content</p>
      </MotionPresence>,
    );

    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders with initial false", () => {
    renderWithProviders(
      <MotionPresence initial={false}>
        <p>Content</p>
      </MotionPresence>,
    );

    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});
