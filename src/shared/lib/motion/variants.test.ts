import { describe, expect, it } from "vitest";

import { STAGGER } from "./timing";
import { createStaggerContainer, getVariant, VARIANTS } from "./variants";

import type { Transition } from "motion/react";

describe("VARIANTS", () => {
  const expectedVariants = [
    "fadeIn",
    "fadeInUp",
    "fadeInDown",
    "fadeInLeft",
    "fadeInRight",
    "scaleIn",
    "scaleInUp",
    "scaleInDown",
    "slideInLeft",
    "slideInRight",
    "slideInUp",
    "slideInDown",
    "bounceIn",
    "bounceInUp",
    "bounceInDown",
    "flipInX",
    "flipInY",
  ] as const;

  it("contains all preset variants", () => {
    for (const name of expectedVariants) {
      expect(VARIANTS).toHaveProperty(name);
    }
  });

  it("all variants have hidden and visible states", () => {
    for (const name of expectedVariants) {
      const variant = VARIANTS[name];
      expect(variant).toHaveProperty("hidden");
      expect(variant).toHaveProperty("visible");
    }
  });

  describe("fade variants", () => {
    it("fadeIn has opacity transition", () => {
      expect(VARIANTS.fadeIn.hidden).toMatchObject({ opacity: 0 });
      expect(VARIANTS.fadeIn.visible).toMatchObject({ opacity: 1 });
    });

    it("fadeInUp has y transform", () => {
      expect(VARIANTS.fadeInUp.hidden).toMatchObject({ opacity: 0, y: 20 });
      expect(VARIANTS.fadeInUp.visible).toMatchObject({ opacity: 1, y: 0 });
    });

    it("fadeInDown has negative y transform", () => {
      expect(VARIANTS.fadeInDown.hidden).toMatchObject({ opacity: 0, y: -20 });
      expect(VARIANTS.fadeInDown.visible).toMatchObject({ opacity: 1, y: 0 });
    });

    it("fadeInLeft has x transform", () => {
      expect(VARIANTS.fadeInLeft.hidden).toMatchObject({ opacity: 0, x: -20 });
      expect(VARIANTS.fadeInLeft.visible).toMatchObject({ opacity: 1, x: 0 });
    });

    it("fadeInRight has negative x transform", () => {
      expect(VARIANTS.fadeInRight.hidden).toMatchObject({ opacity: 0, x: 20 });
      expect(VARIANTS.fadeInRight.visible).toMatchObject({ opacity: 1, x: 0 });
    });
  });

  describe("scale variants", () => {
    it("scaleIn has scale transition", () => {
      expect(VARIANTS.scaleIn.hidden).toMatchObject({ opacity: 0, scale: 0.95 });
      expect(VARIANTS.scaleIn.visible).toMatchObject({ opacity: 1, scale: 1 });
    });

    it("scaleInUp has scale and y transform", () => {
      expect(VARIANTS.scaleInUp.hidden).toMatchObject({
        opacity: 0,
        scale: 0.95,
        y: 10,
      });
      expect(VARIANTS.scaleInUp.visible).toMatchObject({
        opacity: 1,
        scale: 1,
        y: 0,
      });
    });
  });

  describe("slide variants", () => {
    it("slideInLeft has x offset", () => {
      expect(VARIANTS.slideInLeft.hidden).toMatchObject({ opacity: 0, x: -50 });
      expect(VARIANTS.slideInLeft.visible).toMatchObject({ opacity: 1, x: 0 });
    });

    it("slideInRight has positive x offset", () => {
      expect(VARIANTS.slideInRight.hidden).toMatchObject({ opacity: 0, x: 50 });
      expect(VARIANTS.slideInRight.visible).toMatchObject({ opacity: 1, x: 0 });
    });
  });

  describe("bounce variants", () => {
    it("bounceIn has spring transition", () => {
      const visible = VARIANTS.bounceIn.visible as { transition: Transition };
      expect(visible.transition).toMatchObject({ type: "spring" });
    });

    it("bounceInUp has spring transition", () => {
      const visible = VARIANTS.bounceInUp.visible as { transition: Transition };
      expect(visible.transition).toMatchObject({ type: "spring" });
    });
  });

  describe("flip variants", () => {
    it("flipInX has rotateX transform", () => {
      expect(VARIANTS.flipInX.hidden).toMatchObject({ rotateX: -90 });
      expect(VARIANTS.flipInX.visible).toMatchObject({ rotateX: 0 });
    });

    it("flipInY has rotateY transform", () => {
      expect(VARIANTS.flipInY.hidden).toMatchObject({ rotateY: -90 });
      expect(VARIANTS.flipInY.visible).toMatchObject({ rotateY: 0 });
    });
  });
});

describe("getVariant", () => {
  it("returns preset variant for string name", () => {
    expect(getVariant("fadeIn")).toBe(VARIANTS.fadeIn);
    expect(getVariant("fadeInUp")).toBe(VARIANTS.fadeInUp);
    expect(getVariant("bounceIn")).toBe(VARIANTS.bounceIn);
  });

  it("returns custom variant object as-is", () => {
    const customVariant = {
      hidden: { opacity: 0, x: -100 },
      visible: { opacity: 1, x: 0 },
    };
    expect(getVariant(customVariant)).toBe(customVariant);
  });

  it("works with all preset names", () => {
    const presetNames = Object.keys(VARIANTS) as Array<keyof typeof VARIANTS>;
    for (const name of presetNames) {
      expect(getVariant(name)).toBe(VARIANTS[name]);
    }
  });
});

describe("createStaggerContainer", () => {
  it("creates stagger container with default values", () => {
    const container = createStaggerContainer();
    expect(container.hidden).toEqual({ opacity: 0 });
    expect(container.visible).toMatchObject({
      opacity: 1,
      transition: {
        delayChildren: 0,
        staggerChildren: STAGGER.normal,
        staggerDirection: 1,
      },
    });
  });

  it("creates stagger container with custom stagger delay", () => {
    const container = createStaggerContainer({ staggerDelay: 0.2 });
    const visible = container.visible as { transition: Transition };
    expect(visible.transition).toMatchObject({
      staggerChildren: 0.2,
    });
  });

  it("creates stagger container with reverse direction", () => {
    const container = createStaggerContainer({ staggerReverse: true });
    const visible = container.visible as { transition: Transition };
    expect(visible.transition).toMatchObject({
      staggerDirection: -1,
    });
  });

  it("creates stagger container with delay children", () => {
    const container = createStaggerContainer({ delayChildren: 0.5 });
    const visible = container.visible as { transition: Transition };
    expect(visible.transition).toMatchObject({
      delayChildren: 0.5,
    });
  });

  it("creates stagger container with all options", () => {
    const container = createStaggerContainer({
      delayChildren: 0.3,
      staggerDelay: 0.15,
      staggerReverse: true,
    });
    const visible = container.visible as { transition: Transition };
    expect(visible.transition).toMatchObject({
      delayChildren: 0.3,
      staggerChildren: 0.15,
      staggerDirection: -1,
    });
  });
});
