import type {
  MotionPresetName,
  StaggerPreset,
  TextAnimationMode,
} from "@/shared/lib/motion";

/**
 * Default animation mode.
 */
export const DEFAULT_MODE: TextAnimationMode = "words";

/**
 * Default variant for text segment animations.
 */
export const DEFAULT_VARIANT: MotionPresetName = "fadeInUp";

/**
 * Default stagger delay between segments.
 */
export const DEFAULT_STAGGER_DELAY: StaggerPreset = "fast";

/**
 * Default viewport amount threshold.
 */
export const DEFAULT_VIEWPORT_AMOUNT = 0.1;

/**
 * Default value for once prop.
 */
export const DEFAULT_ONCE = true;
