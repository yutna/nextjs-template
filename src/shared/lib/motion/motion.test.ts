import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
  createStaggerContainer,
  createTransition,
  DURATION,
  EASING,
  getDuration,
  getEasing,
  getMotionDataAttrs,
  getReducedMotionVariant,
  getStaggerDelay,
  getVariant,
  isSpringEasing,
  MOTION_DATA_ATTR,
  prefersReducedMotion,
  STAGGER,
  VARIANTS,
} from "./index";

import type { Transition } from "motion/react";

describe("timing", () => {
  describe("getDuration", () => {
    it("returns preset value for string input", () => {
      expect(getDuration("micro")).toBe(0.15);
      expect(getDuration("fast")).toBe(0.2);
      expect(getDuration("normal")).toBe(0.3);
      expect(getDuration("slow")).toBe(0.5);
      expect(getDuration("slower")).toBe(0.8);
    });

    it("returns custom number as-is", () => {
      expect(getDuration(0.42)).toBe(0.42);
      expect(getDuration(1.5)).toBe(1.5);
    });
  });

  describe("getEasing", () => {
    it("returns easing value for preset name", () => {
      expect(getEasing("easeOut")).toEqual([0.0, 0.0, 0.2, 1]);
      expect(getEasing("easeIn")).toEqual([0.4, 0.0, 1, 1]);
      expect(getEasing("easeInOut")).toEqual([0.4, 0.0, 0.2, 1]);
    });

    it("returns spring config for spring presets", () => {
      expect(getEasing("spring")).toEqual({
        damping: 30,
        stiffness: 400,
        type: "spring",
      });
      expect(getEasing("bounce")).toEqual({
        damping: 10,
        stiffness: 300,
        type: "spring",
      });
    });
  });

  describe("getStaggerDelay", () => {
    it("returns preset value for string input", () => {
      expect(getStaggerDelay("fast")).toBe(0.05);
      expect(getStaggerDelay("normal")).toBe(0.1);
      expect(getStaggerDelay("slow")).toBe(0.15);
    });

    it("returns custom number as-is", () => {
      expect(getStaggerDelay(0.25)).toBe(0.25);
    });
  });

  describe("isSpringEasing", () => {
    it("returns true for spring configurations", () => {
      expect(isSpringEasing(EASING.spring)).toBe(true);
      expect(isSpringEasing(EASING.bounce)).toBe(true);
    });

    it("returns false for bezier curves", () => {
      expect(isSpringEasing(EASING.easeOut)).toBe(false);
      expect(isSpringEasing(EASING.easeIn)).toBe(false);
      expect(isSpringEasing(EASING.easeInOut)).toBe(false);
    });
  });

  describe("createTransition", () => {
    it("creates transition with default values", () => {
      const transition = createTransition({});
      expect(transition).toEqual({
        delay: 0,
        duration: DURATION.normal,
        ease: EASING.easeOut,
      });
    });

    it("creates transition with custom duration preset", () => {
      const transition = createTransition({ duration: "slow" });
      expect(transition.duration).toBe(DURATION.slow);
    });

    it("creates transition with custom duration number", () => {
      const transition = createTransition({ duration: 0.75 });
      expect(transition.duration).toBe(0.75);
    });

    it("creates spring transition for spring easing", () => {
      const transition = createTransition({ delay: 0.2, easing: "spring" });
      expect(transition).toEqual({
        damping: 30,
        delay: 0.2,
        stiffness: 400,
        type: "spring",
      });
    });

    it("creates bounce transition for bounce easing", () => {
      const transition = createTransition({ easing: "bounce" });
      expect(transition).toEqual({
        damping: 10,
        delay: 0,
        stiffness: 300,
        type: "spring",
      });
    });
  });
});

describe("variants", () => {
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
  });

  describe("VARIANTS", () => {
    it("contains all preset variants", () => {
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
      ];

      for (const name of expectedVariants) {
        expect(VARIANTS).toHaveProperty(name);
        expect(VARIANTS[name as keyof typeof VARIANTS]).toHaveProperty("hidden");
        expect(VARIANTS[name as keyof typeof VARIANTS]).toHaveProperty("visible");
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
  });
});

describe("reduced-motion", () => {
  describe("prefersReducedMotion", () => {
    let originalMatchMedia: typeof window.matchMedia;

    beforeEach(() => {
      originalMatchMedia = window.matchMedia;
    });

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    it("returns false when matchMedia returns false", () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: false });
      expect(prefersReducedMotion()).toBe(false);
    });

    it("returns true when matchMedia returns true", () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: true });
      expect(prefersReducedMotion()).toBe(true);
    });
  });

  describe("getReducedMotionVariant", () => {
    it("returns minimal opacity-only variant", () => {
      const reduced = getReducedMotionVariant();

      expect(reduced.hidden).toEqual({ opacity: 0 });
      expect(reduced.visible).toMatchObject({ opacity: 1 });
      const visible = reduced.visible as { transition: Transition };
      expect(visible.transition).toMatchObject({
        duration: DURATION.micro,
      });
    });

    it("includes exit state", () => {
      const reduced = getReducedMotionVariant();
      expect(reduced.exit).toMatchObject({ opacity: 0 });
    });
  });

  describe("getMotionDataAttrs", () => {
    it("returns default data attribute without type", () => {
      const attrs = getMotionDataAttrs();
      expect(attrs).toEqual({ [MOTION_DATA_ATTR]: true });
    });

    it("returns typed data attribute with type", () => {
      const attrs = getMotionDataAttrs("reveal");
      expect(attrs).toEqual({ "data-motion-reveal": true });
    });

    it("returns correct attribute for stagger type", () => {
      const attrs = getMotionDataAttrs("stagger");
      expect(attrs).toEqual({ "data-motion-stagger": true });
    });
  });
});
