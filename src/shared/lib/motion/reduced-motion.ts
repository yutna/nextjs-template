"use client";

import { useSyncExternalStore } from "react";

import { DURATION } from "./timing";

import type { MotionVariants } from "./types";

/**
 * Media query for reduced motion preference.
 */
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Get current reduced motion preference from media query.
 */
function getReducedMotionSnapshot(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * Server snapshot always returns false (no motion preference on server).
 */
function getReducedMotionServerSnapshot(): boolean {
  return false;
}

/**
 * Subscribe to reduced motion preference changes.
 */
function subscribeToReducedMotion(callback: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

/**
 * Check if reduced motion is preferred (SSR-safe).
 * Returns false on server, actual preference on client.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * Hook to track reduced motion preference.
 * Updates when user changes system preference.
 *
 * @returns true if user prefers reduced motion
 *
 * @example
 * ```tsx
 * function AnimatedComponent() {
 *   const reducedMotion = useReducedMotion();
 *   const variant = reducedMotion ? "fadeIn" : "bounceIn";
 *   return <MotionReveal variant={variant}>Content</MotionReveal>;
 * }
 * ```
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}

/**
 * Create a reduced motion variant.
 * Returns minimal opacity-only animation for accessibility.
 *
 * @returns Minimal opacity-only variant
 *
 * @example
 * ```tsx
 * const variant = useReducedMotion()
 *   ? getReducedMotionVariant()
 *   : fadeInUp;
 * ```
 */
export function getReducedMotionVariant(): MotionVariants {
  return {
    exit: {
      opacity: 0,
      transition: { duration: DURATION.micro },
    },
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: DURATION.micro },
    },
  };
}

/**
 * Hook to get appropriate variant based on motion preference.
 * Returns reduced motion variant when user prefers reduced motion.
 *
 * @param variant - The full animation variant
 * @returns Object with resolved variant and animation state
 *
 * @example
 * ```tsx
 * function AnimatedCard({ children }) {
 *   const { variant, shouldAnimate } = useMotionPreference(fadeInUp);
 *   return (
 *     <motion.div variants={variant} initial="hidden" animate="visible">
 *       {children}
 *     </motion.div>
 *   );
 * }
 * ```
 */
export function useMotionPreference(variant: MotionVariants): {
  shouldAnimate: boolean;
  variant: MotionVariants;
} {
  const reducedMotion = useReducedMotion();

  return {
    shouldAnimate: !reducedMotion,
    variant: reducedMotion ? getReducedMotionVariant() : variant,
  };
}

/**
 * CSS for reduced motion fallback.
 * Include in global styles or use with a style tag.
 *
 * @example
 * ```tsx
 * // In global styles or _document
 * <style dangerouslySetInnerHTML={{ __html: reducedMotionCSS }} />
 * ```
 */
export const reducedMotionCSS = `
@media (prefers-reduced-motion: reduce) {
  [data-motion],
  [data-motion-reveal],
  [data-motion-stagger],
  [data-motion-text] {
    animation: none !important;
    transition: opacity 0.01s !important;
    transform: none !important;
  }

  [data-motion]::before,
  [data-motion]::after {
    animation: none !important;
    transition: none !important;
  }
}
`;

/**
 * Data attribute for motion components.
 * Used by CSS fallback for reduced motion.
 */
export const MOTION_DATA_ATTR = "data-motion";

/**
 * Get data attributes for motion components.
 * These enable CSS-based reduced motion fallback.
 */
export function getMotionDataAttrs(type?: string): Record<string, boolean> {
  const attr = type ? `data-motion-${type}` : MOTION_DATA_ATTR;
  return { [attr]: true };
}
