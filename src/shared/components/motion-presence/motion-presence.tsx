"use client";

import { AnimatePresence } from "motion/react";

import type { MotionPresenceProps } from "./types";

/**
 * Wrapper component for AnimatePresence that enables exit animations.
 * Children must have motion components with exit variants to animate out.
 *
 * @example
 * ```tsx
 * // Basic usage with conditional rendering
 * <MotionPresence>
 *   {isVisible && (
 *     <MotionReveal key="content">
 *       <Card>Content</Card>
 *     </MotionReveal>
 *   )}
 * </MotionPresence>
 *
 * // Wait mode for route transitions
 * <MotionPresence mode="wait">
 *   <MotionReveal key={pathname}>
 *     {children}
 *   </MotionReveal>
 * </MotionPresence>
 * ```
 */
export function MotionPresence({
  children,
  initial = true,
  mode = "sync",
  onExitComplete,
}: MotionPresenceProps) {
  return (
    <AnimatePresence
      initial={initial}
      mode={mode}
      onExitComplete={onExitComplete}
    >
      {children}
    </AnimatePresence>
  );
}
