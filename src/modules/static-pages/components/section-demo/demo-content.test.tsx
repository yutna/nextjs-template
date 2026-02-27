import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/shared/vendor/chakra-ui/color-mode", () => ({
  ColorModeButton: () => null,
}));

import { renderWithProviders } from "@/test/render-with-providers";

import { CODE_LINES } from "./constants";
import { DemoContent } from "./demo-content";

describe("DemoContent", () => {
  it("renders the codeComment prop text", () => {
    renderWithProviders(<DemoContent codeComment="// test comment" />);
    expect(screen.getByText("// test comment")).toBeInTheDocument();
  });

  it("renders at least one element with line number '1'", () => {
    renderWithProviders(<DemoContent codeComment="comment" />);
    // Line "1" appears as both the comment line number and a code token
    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the last line number (CODE_LINES.length + 2) for the cursor", () => {
    renderWithProviders(<DemoContent codeComment="comment" />);
    const lastLine = CODE_LINES.length + 2;
    expect(screen.getByText(String(lastLine))).toBeInTheDocument();
  });

  it("renders token text from CODE_LINES", () => {
    renderWithProviders(<DemoContent codeComment="comment" />);
    // "import" keyword appears in the first code line
    expect(screen.getAllByText("import").length).toBeGreaterThan(0);
  });
});
