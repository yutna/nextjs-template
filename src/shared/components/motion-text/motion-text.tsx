"use client";

import * as motion from "motion/react-client";

import {
  createStaggerContainer,
  getMotionDataAttrs,
  getReducedMotionVariant,
  getStaggerDelay,
  getVariant,
  useReducedMotion,
} from "@/shared/lib/motion";

import {
  DEFAULT_MODE,
  DEFAULT_ONCE,
  DEFAULT_STAGGER_DELAY,
  DEFAULT_VARIANT,
  DEFAULT_VIEWPORT_AMOUNT,
} from "./constants";
import { isWhitespace, splitText } from "./helpers";

import type { MotionTextProps } from "./types";

/**
 * Animated text component that reveals text by characters, words, or lines.
 * Each segment animates in sequence with a stagger effect.
 *
 * @example
 * ```tsx
 * // Word-by-word animation
 * <MotionText>Hello World</MotionText>
 *
 * // Character-by-character
 * <MotionText mode="characters" variant="fadeIn">
 *   Animate each letter
 * </MotionText>
 *
 * // As heading
 * <MotionText as="h1" variant="slideInUp" staggerDelay={0.05}>
 *   Welcome to our site
 * </MotionText>
 * ```
 */
export function MotionText({
  amount = DEFAULT_VIEWPORT_AMOUNT,
  "aria-label": ariaLabel,
  as = "span",
  children,
  className,
  "data-testid": dataTestId,
  delay = 0,
  disabled = false,
  margin,
  mode = DEFAULT_MODE,
  once = DEFAULT_ONCE,
  preserveWhitespace = true,
  root,
  staggerDelay = DEFAULT_STAGGER_DELAY,
  variant = DEFAULT_VARIANT,
}: MotionTextProps) {
  const prefersReducedMotion = useReducedMotion();

  const segments = splitText(children, mode);

  const containerVariants = createStaggerContainer({
    delayChildren: delay,
    staggerDelay: getStaggerDelay(staggerDelay),
  });

  const baseItemVariants = getVariant(variant);
  const itemVariants =
    prefersReducedMotion || disabled
      ? getReducedMotionVariant()
      : baseItemVariants;

  const viewport = {
    amount,
    margin,
    once,
    root,
  };

  const dataAttrs = getMotionDataAttrs("text");
  const commonProps = {
    "aria-label": ariaLabel,
    className,
    "data-testid": dataTestId,
    initial: "hidden" as const,
    style: { display: "inline-block" as const },
    variants: containerVariants,
    viewport,
    whileInView: "visible" as const,
    ...dataAttrs,
  };

  const renderSegments = () =>
    segments.map((segment, index) => {
      if (isWhitespace(segment) && preserveWhitespace) {
        return (
           
          <span key={index} style={{ whiteSpace: "pre" }}>
            {segment}
          </span>
        );
      }

      return (
        <motion.span
          key={index}
           
          style={{ display: "inline-block" }}
          variants={itemVariants}
        >
          {segment}
        </motion.span>
      );
    });

  // Render based on element type to avoid type issues
  switch (as) {
    case "p":
      return <motion.p {...commonProps}>{renderSegments()}</motion.p>;
    case "h1":
      return <motion.h1 {...commonProps}>{renderSegments()}</motion.h1>;
    case "h2":
      return <motion.h2 {...commonProps}>{renderSegments()}</motion.h2>;
    case "h3":
      return <motion.h3 {...commonProps}>{renderSegments()}</motion.h3>;
    case "h4":
      return <motion.h4 {...commonProps}>{renderSegments()}</motion.h4>;
    case "h5":
      return <motion.h5 {...commonProps}>{renderSegments()}</motion.h5>;
    case "h6":
      return <motion.h6 {...commonProps}>{renderSegments()}</motion.h6>;
    case "div":
      return <motion.div {...commonProps}>{renderSegments()}</motion.div>;
    default:
      return <motion.span {...commonProps}>{renderSegments()}</motion.span>;
  }
}
