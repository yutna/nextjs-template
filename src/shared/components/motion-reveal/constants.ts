import type { DurationPreset, EasingPreset, MotionPresetName } from "@/shared/lib/motion";

/**
 * Default variant for reveal animations.
 */
export const DEFAULT_VARIANT: MotionPresetName = "fadeInUp";

/**
 * Default duration for reveal animations.
 */
export const DEFAULT_DURATION: DurationPreset = "normal";

/**
 * Default easing for reveal animations.
 */
export const DEFAULT_EASING: EasingPreset = "easeOut";

/**
 * Default viewport amount threshold.
 */
export const DEFAULT_VIEWPORT_AMOUNT = 0.1;

/**
 * Default value for once prop.
 */
export const DEFAULT_ONCE = true;
