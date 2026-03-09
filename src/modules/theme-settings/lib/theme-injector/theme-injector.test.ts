import { describe, expect, it, vi } from "vitest";

import { clearThemeCssVars, injectThemeCssVars } from "./theme-injector";

describe("theme-injector", () => {
  it("sets CSS custom properties on documentElement", () => {
    const setProperty = vi.fn();
    vi.stubGlobal("document", {
      documentElement: { style: { removeProperty: vi.fn(), setProperty } },
    });

    injectThemeCssVars({ "--chakra-colors-bg": "#ffffff" });

    expect(setProperty).toHaveBeenCalledWith("--chakra-colors-bg", "#ffffff");
  });

  it("removes CSS custom properties from documentElement", () => {
    const removeProperty = vi.fn();
    vi.stubGlobal("document", {
      documentElement: { style: { removeProperty, setProperty: vi.fn() } },
    });

    clearThemeCssVars(["--chakra-colors-bg", "--chakra-radii-l1"]);

    expect(removeProperty).toHaveBeenCalledWith("--chakra-colors-bg");
    expect(removeProperty).toHaveBeenCalledWith("--chakra-radii-l1");
  });
});
