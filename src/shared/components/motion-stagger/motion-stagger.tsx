"use client";

import * as motion from "motion/react-client";
import { Children } from "react";

import {
  getMotionDataAttrs,
  getReducedMotionVariant,
  useReducedMotion,
} from "@/shared/lib/motion";

import {
  DEFAULT_DURATION,
  DEFAULT_EASING,
  DEFAULT_ITEM_VARIANT,
  DEFAULT_ONCE,
  DEFAULT_STAGGER_DELAY,
  DEFAULT_VIEWPORT_AMOUNT,
} from "./constants";
import { buildContainerVariants, buildItemVariants } from "./helpers";

import type { MotionStaggerProps } from "./types";

/**
 * Animated container that staggers the animation of its children.
 * Each child animates in sequence with a configurable delay.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <MotionStagger>
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </MotionStagger>
 *
 * // Custom stagger timing
 * <MotionStagger staggerDelay={0.15} itemVariant="slideInLeft">
 *   {items.map(item => <Card key={item.id}>{item.name}</Card>)}
 * </MotionStagger>
 * ```
 */
export function MotionStagger({
  amount = DEFAULT_VIEWPORT_AMOUNT,
  as = "div",
  children,
  className,
  delayChildren = 0,
  disabled = false,
  duration = DEFAULT_DURATION,
  easing = DEFAULT_EASING,
  itemAs = "div",
  itemClassName,
  itemVariant = DEFAULT_ITEM_VARIANT,
  margin,
  once = DEFAULT_ONCE,
  root,
  staggerDelay = DEFAULT_STAGGER_DELAY,
  staggerReverse = false,
}: MotionStaggerProps) {
  const prefersReducedMotion = useReducedMotion();

  const MotionContainer = motion[as] as typeof motion.div;
  const MotionItem = motion[itemAs] as typeof motion.div;

  const containerVariants = buildContainerVariants({
    delayChildren,
    staggerDelay,
    staggerReverse,
  });

  const baseItemVariants = buildItemVariants(itemVariant, { duration, easing });
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

  const childArray = Children.toArray(children);

  return (
    <MotionContainer
      className={className}
      initial="hidden"
      variants={containerVariants}
      viewport={viewport}
      whileInView="visible"
      {...getMotionDataAttrs("stagger")}
    >
      {childArray.map((child, index) => (
        <MotionItem
          className={itemClassName}
          key={index}
          variants={itemVariants}
        >
          {child}
        </MotionItem>
      ))}
    </MotionContainer>
  );
}
