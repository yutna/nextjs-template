import { describe, expect, it } from "vitest";

import { STAGGER, VARIANTS } from "@/shared/lib/motion";

import { buildContainerVariants, buildItemVariants } from "./helpers";

import type { Transition } from "motion/react";

describe("buildContainerVariants", () => {
  it("creates container with default values", () => {
    const result = buildContainerVariants({});
    expect(result.hidden).toEqual({ opacity: 0 });
    expect(result.visible).toMatchObject({
      opacity: 1,
      transition: {
        delayChildren: 0,
        staggerChildren: STAGGER.normal,
        staggerDirection: 1,
      },
    });
  });

  it("applies custom delay children", () => {
    const result = buildContainerVariants({ delayChildren: 0.5 });
    const visible = result.visible as { transition: Transition };
    expect(visible.transition).toMatchObject({ delayChildren: 0.5 });
  });

  it("applies custom stagger delay as number", () => {
    const result = buildContainerVariants({ staggerDelay: 0.15 });
    const visible = result.visible as { transition: Transition };
    expect(visible.transition).toMatchObject({ staggerChildren: 0.15 });
  });

  it("applies stagger delay preset", () => {
    const result = buildContainerVariants({ staggerDelay: "fast" });
    const visible = result.visible as { transition: Transition };
    expect(visible.transition).toMatchObject({ staggerChildren: STAGGER.fast });
  });

  it("applies reverse stagger direction", () => {
    const result = buildContainerVariants({ staggerReverse: true });
    const visible = result.visible as { transition: Transition };
    expect(visible.transition).toMatchObject({ staggerDirection: -1 });
  });
});

describe("buildItemVariants", () => {
  it("returns base variant unchanged when no custom timing", () => {
    const result = buildItemVariants("fadeInUp", {});
    expect(result).toBe(VARIANTS.fadeInUp);
  });

  it("applies custom duration to visible state", () => {
    const result = buildItemVariants("fadeInUp", { duration: 0.6 });
    expect(result.visible).toMatchObject({
      transition: expect.objectContaining({ duration: 0.6 }),
    });
  });

  it("applies duration preset to visible state", () => {
    const result = buildItemVariants("fadeInUp", { duration: "fast" });
    expect(result.visible).toMatchObject({
      transition: expect.objectContaining({ duration: 0.2 }),
    });
  });

  it("applies custom easing to visible state", () => {
    const result = buildItemVariants("fadeInUp", { easing: "easeInOut" });
    expect(result.visible).toMatchObject({
      transition: expect.objectContaining({ ease: [0.4, 0.0, 0.2, 1] }),
    });
  });

  it("accepts custom variant object", () => {
    const customVariant = {
      hidden: { opacity: 0, scale: 0.5 },
      visible: { opacity: 1, scale: 1 },
    };
    const result = buildItemVariants(customVariant, { duration: 0.4 });
    expect(result.hidden).toEqual({ opacity: 0, scale: 0.5 });
    expect(result.visible).toMatchObject({
      opacity: 1,
      scale: 1,
      transition: expect.objectContaining({ duration: 0.4 }),
    });
  });
});
