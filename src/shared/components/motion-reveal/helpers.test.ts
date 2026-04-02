import { describe, expect, it } from "vitest";

import { VARIANTS } from "@/shared/lib/motion";

import { buildVariants } from "./helpers";

describe("buildVariants", () => {
  it("returns base variant unchanged when no custom timing", () => {
    const result = buildVariants("fadeIn", {});
    expect(result).toBe(VARIANTS.fadeIn);
  });

  it("applies custom delay to visible state", () => {
    const result = buildVariants("fadeIn", { delay: 0.5 });
    expect(result.visible).toMatchObject({
      transition: expect.objectContaining({ delay: 0.5 }),
    });
  });

  it("applies custom duration to visible state", () => {
    const result = buildVariants("fadeIn", { duration: 0.8 });
    expect(result.visible).toMatchObject({
      transition: expect.objectContaining({ duration: 0.8 }),
    });
  });

  it("applies duration preset to visible state", () => {
    const result = buildVariants("fadeIn", { duration: "slow" });
    expect(result.visible).toMatchObject({
      transition: expect.objectContaining({ duration: 0.5 }),
    });
  });

  it("applies custom easing to visible state", () => {
    const result = buildVariants("fadeIn", { easing: "easeIn" });
    expect(result.visible).toMatchObject({
      transition: expect.objectContaining({ ease: [0.4, 0.0, 1, 1] }),
    });
  });

  it("accepts custom variant object", () => {
    const customVariant = {
      hidden: { opacity: 0, x: -100 },
      visible: { opacity: 1, x: 0 },
    };
    const result = buildVariants(customVariant, { delay: 0.2 });
    expect(result.hidden).toEqual({ opacity: 0, x: -100 });
    expect(result.visible).toMatchObject({
      opacity: 1,
      transition: expect.objectContaining({ delay: 0.2 }),
      x: 0,
    });
  });
});
