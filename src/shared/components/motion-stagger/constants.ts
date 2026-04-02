import type {
  DurationPreset,
  EasingPreset,
  MotionPresetName,
  StaggerPreset,
} from "@/shared/lib/motion";

/**
 * Default variant for stagger item animations.
 */
export const DEFAULT_ITEM_VARIANT: MotionPresetName = "fadeInUp";

/**
 * Default stagger delay between items.
 */
export const DEFAULT_STAGGER_DELAY: StaggerPreset = "normal";

/**
 * Default duration for item animations.
 */
export const DEFAULT_DURATION: DurationPreset = "normal";

/**
 * Default easing for item animations.
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
