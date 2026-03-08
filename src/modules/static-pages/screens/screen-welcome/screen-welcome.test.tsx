import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ScreenWelcome } from "./screen-welcome";

vi.mock("server-only", () => ({}));
vi.mock("@/modules/static-pages/containers/container-welcome-page", () => ({
  ContainerWelcomePage: () => null,
}));

describe("ScreenWelcome", () => {
  it("renders without errors", async () => {
    const { container } = renderWithProviders(
      await ScreenWelcome({ locale: "en" }),
    );
    expect(container).toBeDefined();
  });
});
