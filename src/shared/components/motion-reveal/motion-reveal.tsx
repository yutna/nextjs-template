"use client";

import * as motion from "motion/react-client";

import {
  getMotionDataAttrs,
  getReducedMotionVariant,
  useReducedMotion,
} from "@/shared/lib/motion";

import {
  DEFAULT_DURATION,
  DEFAULT_EASING,
  DEFAULT_ONCE,
  DEFAULT_VARIANT,
  DEFAULT_VIEWPORT_AMOUNT,
} from "./constants";
import { buildVariants } from "./helpers";

import type { MotionRevealProps } from "./types";

/**
 * Animated container that reveals its content when entering the viewport.
 * Supports multiple animation presets and respects reduced motion preferences.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <MotionReveal>
 *   <Card>Content</Card>
 * </MotionReveal>
 *
 * // With custom variant
 * <MotionReveal variant="slideInLeft" delay={0.2}>
 *   <Section>Content</Section>
 * </MotionReveal>
 *
 * // As different element
 * <MotionReveal as="section" variant="fadeIn">
 *   <Content />
 * </MotionReveal>
 * ```
 */
export function MotionReveal({
  amount = DEFAULT_VIEWPORT_AMOUNT,
  "aria-label": ariaLabel,
  as = "div",
  children,
  className,
  "data-testid": dataTestId,
  delay = 0,
  disabled = false,
  duration = DEFAULT_DURATION,
  easing = DEFAULT_EASING,
  margin,
  once = DEFAULT_ONCE,
  root,
  variant = DEFAULT_VARIANT,
}: MotionRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  // Get the appropriate motion component for the element type
  const MotionComponent = motion[as] as typeof motion.div;

  // Build variants with custom timing
  const baseVariants = buildVariants(variant, { delay, duration, easing });

  // Apply reduced motion variant if needed
  const finalVariants =
    prefersReducedMotion || disabled
      ? getReducedMotionVariant()
      : baseVariants;

  // Build viewport options
  const viewport = {
    amount,
    margin,
    once,
    root,
  };

  return (
    <MotionComponent
      aria-label={ariaLabel}
      className={className}
      data-testid={dataTestId}
      initial="hidden"
      variants={finalVariants}
      viewport={viewport}
      whileInView="visible"
      {...getMotionDataAttrs("reveal")}
    >
      {children}
    </MotionComponent>
  );
}
