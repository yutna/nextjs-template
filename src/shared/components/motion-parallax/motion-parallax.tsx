"use client";

import { useScroll, useTransform } from "motion/react";
import * as motion from "motion/react-client";
import { useRef } from "react";

import { getMotionDataAttrs, useReducedMotion } from "@/shared/lib/motion";

import { DEFAULT_OFFSET, DEFAULT_PARALLAX_SPEED } from "./constants";

import type { MotionParallaxProps } from "./types";

/**
 * Component that applies a parallax effect based on scroll.
 * Elements move at a different speed than the scroll.
 *
 * @example
 * ```tsx
 * // Slower than scroll (background effect)
 * <MotionParallax speed={0.5}>
 *   <Image src="background.jpg" />
 * </MotionParallax>
 *
 * // Faster than scroll (foreground effect)
 * <MotionParallax speed={-0.3}>
 *   <FloatingElement />
 * </MotionParallax>
 * ```
 */
export function MotionParallax({
  as = "div",
  children,
  className,
  disabled = false,
  speed = DEFAULT_PARALLAX_SPEED,
}: MotionParallaxProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    offset: DEFAULT_OFFSET,
    target: containerRef,
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`${-50 * speed}%`, `${50 * speed}%`],
  );

  const MotionComponent = motion[as] as typeof motion.div;

  if (prefersReducedMotion || disabled) {
    const StaticComponent = as;
    return (
      <StaticComponent className={className} {...getMotionDataAttrs("parallax")}>
        {children}
      </StaticComponent>
    );
  }

  return (
    <MotionComponent
      className={className}
      ref={containerRef as React.RefObject<HTMLDivElement>}
      style={{ y }}
      {...getMotionDataAttrs("parallax")}
    >
      {children}
    </MotionComponent>
  );
}
