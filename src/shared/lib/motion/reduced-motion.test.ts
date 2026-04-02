import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getMotionDataAttrs,
  getReducedMotionVariant,
  MOTION_DATA_ATTR,
  prefersReducedMotion,
} from "./reduced-motion";
import { DURATION } from "./timing";

import type { Transition } from "motion/react";

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

  it("returns consistent structure for reduced motion", () => {
    const reduced = getReducedMotionVariant();

    // Should have hidden, visible, and exit states
    expect(reduced.hidden).toBeDefined();
    expect(reduced.visible).toBeDefined();
    expect(reduced.exit).toBeDefined();
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

  it("returns correct attribute for text type", () => {
    const attrs = getMotionDataAttrs("text");
    expect(attrs).toEqual({ "data-motion-text": true });
  });

  it("returns correct attribute for scroll type", () => {
    const attrs = getMotionDataAttrs("scroll");
    expect(attrs).toEqual({ "data-motion-scroll": true });
  });
});

describe("MOTION_DATA_ATTR", () => {
  it("equals data-motion", () => {
    expect(MOTION_DATA_ATTR).toBe("data-motion");
  });
});
