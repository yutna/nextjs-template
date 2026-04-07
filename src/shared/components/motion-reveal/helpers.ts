import {
  createTransition,
  getVariant,
  type MotionBaseProps,
  type MotionPresetName,
} from "@/shared/lib/motion";

import type { MotionVariants } from "@/shared/lib/motion";

/**
 * Build the final variants object with custom timing applied.
 */
export function buildVariants(
  variant: MotionPresetName | MotionVariants,
  options: MotionBaseProps,
): MotionVariants {
  const baseVariant = getVariant(variant);
  const { delay, duration, easing } = options;

  // If no custom timing, return base variant as-is
  if (duration === undefined && easing === undefined && delay === undefined) {
    return baseVariant;
  }

  const transition = createTransition({
    delay,
    duration,
    easing,
  });

  return {
    ...baseVariant,
    visible: {
      ...baseVariant.visible,
      transition,
    },
  };
}
