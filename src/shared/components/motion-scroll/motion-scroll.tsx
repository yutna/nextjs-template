"use client";

import { useScroll, useTransform } from "motion/react";
import * as motion from "motion/react-client";
import { useRef } from "react";

import { getMotionDataAttrs, useReducedMotion } from "@/shared/lib/motion";

import { DEFAULT_OFFSET } from "./constants";

import type { MotionScrollProps } from "./types";

/**
 * Component that animates based on scroll position.
 * Transforms CSS properties as the element scrolls through the viewport.
 *
 * @example
 * ```tsx
 * // Fade and scale on scroll
 * <MotionScroll style={{ opacity: [0, 1], scale: [0.8, 1] }}>
 *   <Card>Content</Card>
 * </MotionScroll>
 *
 * // Horizontal parallax
 * <MotionScroll style={{ x: [-50, 50] }}>
 *   <Image src="..." />
 * </MotionScroll>
 * ```
 */
export function MotionScroll({
  as = "div",
  children,
  className,
  disabled = false,
  offset = DEFAULT_OFFSET,
  staticStyle,
  style,
  target,
}: MotionScrollProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    offset,
    ...(prefersReducedMotion || disabled
      ? {}
      : { target: target ?? containerRef }),
  });
  const opacity = useTransform(
    scrollYProgress,
    [0, 1],
    style?.opacity ?? [1, 1],
  );
  const scale = useTransform(scrollYProgress, [0, 1], style?.scale ?? [1, 1]);
  const x = useTransform(scrollYProgress, [0, 1], style?.x ?? [0, 0]);
  const y = useTransform(scrollYProgress, [0, 1], style?.y ?? [0, 0]);
  const rotate = useTransform(
    scrollYProgress,
    [0, 1],
    style?.rotate ?? [0, 0],
  );

  const MotionComponent = motion[as] as typeof motion.div;

  if (prefersReducedMotion || disabled) {
    const StaticComponent = as;
    return (
      <StaticComponent
        className={className}
        style={staticStyle}
        {...getMotionDataAttrs("scroll")}
      >
        {typeof children === "function"
          ? children({ progress: 1, scrollYProgress: 1 })
          : children}
      </StaticComponent>
    );
  }

  return (
    <MotionComponent
      className={className}
      ref={containerRef as React.RefObject<HTMLDivElement>}
      style={{
        ...staticStyle,
        opacity,
        rotate,
        scale,
        x,
        y,
      }}
      {...getMotionDataAttrs("scroll")}
    >
      {typeof children === "function"
        ? children({ progress: 0, scrollYProgress: 0 })
        : children}
    </MotionComponent>
  );
}
