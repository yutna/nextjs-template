import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseInView = vi.hoisted(() => vi.fn());
const mockAnimate = vi.hoisted(() => vi.fn());

vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  return {
    ...actual,
    useInView: mockUseInView,
    animate: mockAnimate,
  };
});

import { renderWithProviders } from "@/test/render-with-providers";

import { AnimatedCounter } from "./animated-counter";

describe("AnimatedCounter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAnimate.mockReturnValue({ stop: vi.fn() });
  });

  it("displays 0 before the element is in view", () => {
    mockUseInView.mockReturnValue(false);
    renderWithProviders(<AnimatedCounter target={100} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("calls animate with correct arguments when in view", () => {
    mockUseInView.mockReturnValue(true);
    renderWithProviders(<AnimatedCounter target={42} duration={1} />);
    expect(mockAnimate).toHaveBeenCalledWith(
      0,
      42,
      expect.objectContaining({ duration: 1, ease: "easeOut" }),
    );
  });

  it("does not call animate when not in view", () => {
    mockUseInView.mockReturnValue(false);
    renderWithProviders(<AnimatedCounter target={100} />);
    expect(mockAnimate).not.toHaveBeenCalled();
  });

  it("renders prefix and suffix around the display value", () => {
    mockUseInView.mockReturnValue(false);
    renderWithProviders(
      <AnimatedCounter
        target={99}
        prefix="$"
        suffix="+"
        data-testid="counter"
      />,
    );
    const el = screen.getByTestId("counter");
    expect(el).toHaveTextContent("$");
    expect(el).toHaveTextContent("+");
  });

  it("forwards extra TextProps to the underlying Text element", () => {
    mockUseInView.mockReturnValue(false);
    renderWithProviders(<AnimatedCounter target={10} data-testid="counter" />);
    expect(screen.getByTestId("counter")).toBeInTheDocument();
  });

  it("uses a default duration of 2 when none is provided", () => {
    mockUseInView.mockReturnValue(true);
    renderWithProviders(<AnimatedCounter target={50} />);
    expect(mockAnimate).toHaveBeenCalledWith(
      0,
      50,
      expect.objectContaining({ duration: 2 }),
    );
  });
});
