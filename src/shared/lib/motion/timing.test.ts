import { describe, expect, it } from "vitest";

import {
  createTransition,
  DURATION,
  EASING,
  getDuration,
  getEasing,
  getStaggerDelay,
  isSpringEasing,
  STAGGER,
} from "./timing";

describe("DURATION", () => {
  it("contains all preset durations", () => {
    expect(DURATION.micro).toBe(0.15);
    expect(DURATION.fast).toBe(0.2);
    expect(DURATION.normal).toBe(0.3);
    expect(DURATION.slow).toBe(0.5);
    expect(DURATION.slower).toBe(0.8);
  });
});

describe("EASING", () => {
  it("contains bezier curve easings", () => {
    expect(EASING.easeOut).toEqual([0.0, 0.0, 0.2, 1]);
    expect(EASING.easeIn).toEqual([0.4, 0.0, 1, 1]);
    expect(EASING.easeInOut).toEqual([0.4, 0.0, 0.2, 1]);
  });

  it("contains spring configurations", () => {
    expect(EASING.spring).toEqual({
      damping: 30,
      stiffness: 400,
      type: "spring",
    });
    expect(EASING.bounce).toEqual({
      damping: 10,
      stiffness: 300,
      type: "spring",
    });
  });
});

describe("STAGGER", () => {
  it("contains all preset stagger delays", () => {
    expect(STAGGER.fast).toBe(0.05);
    expect(STAGGER.normal).toBe(0.1);
    expect(STAGGER.slow).toBe(0.15);
  });
});

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
    expect(getDuration(0)).toBe(0);
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
    expect(getStaggerDelay(0.08)).toBe(0.08);
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

  it("returns false for array input", () => {
    expect(isSpringEasing([0.4, 0, 0.2, 1])).toBe(false);
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

  it("creates transition with custom delay", () => {
    const transition = createTransition({ delay: 0.3 });
    expect(transition.delay).toBe(0.3);
  });

  it("creates transition with custom easing preset", () => {
    const transition = createTransition({ easing: "easeIn" });
    expect(transition.ease).toEqual(EASING.easeIn);
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

  it("ignores duration for spring transitions", () => {
    const transition = createTransition({
      duration: "slow",
      easing: "spring",
    });
    expect(transition).not.toHaveProperty("duration");
    expect(transition).toHaveProperty("type", "spring");
  });
});
