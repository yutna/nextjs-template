import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { LoadingGlobal } from "./loading-global";

describe("LoadingGlobal", () => {
  it("renders a spinner element", () => {
    const { container } = renderWithProviders(<LoadingGlobal />);

    const spinner = container.querySelector(".chakra-spinner");
    expect(spinner).toBeInTheDocument();
  });

  it("renders within a container element", () => {
    const { container } = renderWithProviders(<LoadingGlobal />);

    expect(container.firstChild).toBeDefined();
    expect(container.innerHTML).not.toBe("");
  });
});
