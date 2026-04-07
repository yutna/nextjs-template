import {
  createStaggerContainer,
  createTransition,
  getStaggerDelay,
  getVariant,
  type MotionBaseProps,
  type MotionPresetName,
  type StaggerProps,
} from "@/shared/lib/motion";

import type { MotionVariants } from "@/shared/lib/motion";

/**
 * Build container variants with stagger configuration.
 */
export function buildContainerVariants(options: StaggerProps): MotionVariants {
  const {
    delayChildren = 0,
    staggerDelay = "normal",
    staggerReverse = false,
  } = options;

  return createStaggerContainer({
    delayChildren,
    staggerDelay: getStaggerDelay(staggerDelay),
    staggerReverse,
  });
}

/**
 * Build item variants with custom timing.
 */
export function buildItemVariants(
  variant: MotionPresetName | MotionVariants,
  options: Pick<MotionBaseProps, "duration" | "easing">,
): MotionVariants {
  const baseVariant = getVariant(variant);
  const { duration, easing } = options;

  if (duration === undefined && easing === undefined) {
    return baseVariant;
  }

  const transition = createTransition({ duration, easing });

  return {
    ...baseVariant,
    visible: {
      ...baseVariant.visible,
      transition,
    },
  };
}
