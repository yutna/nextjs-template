import type {
  DurationPreset,
  EasingPreset,
  MotionBaseProps,
  StaggerPreset,
} from "./types";

/**
 * Animation duration values in seconds.
 * Use these for consistent timing across the application.
 */
export const DURATION = {
  /** 150ms - Instant feedback (button press, toggle) */
  micro: 0.15,
  /** 200ms - Quick transitions (tooltips, dropdowns) */
  fast: 0.2,
  /** 300ms - Standard animations (modals, cards) */
  normal: 0.3,
  /** 500ms - Emphasis animations (hero reveals) */
  slow: 0.5,
  /** 800ms - Complex sequences (page transitions) */
  slower: 0.8,
} as const satisfies Record<DurationPreset, number>;

/**
 * Easing function definitions.
 * Cubic bezier curves for CSS/Motion compatibility.
 */
export const EASING = {
  /** Decelerate - elements entering view */
  easeOut: [0.0, 0.0, 0.2, 1] as const,
  /** Accelerate - elements leaving view */
  easeIn: [0.4, 0.0, 1, 1] as const,
  /** Standard symmetric curve */
  easeInOut: [0.4, 0.0, 0.2, 1] as const,
  /** Playful spring animation */
  spring: { damping: 30, stiffness: 400, type: "spring" as const },
  /** Bouncy spring animation */
  bounce: { damping: 10, stiffness: 300, type: "spring" as const },
} as const;

/**
 * Stagger delay values in seconds.
 * Use for sequential child animations.
 */
export const STAGGER = {
  /** 50ms - Quick list reveals */
  fast: 0.05,
  /** 100ms - Standard list reveals */
  normal: 0.1,
  /** 150ms - Dramatic sequences */
  slow: 0.15,
} as const satisfies Record<StaggerPreset, number>;

/**
 * Get duration value from preset name or custom number.
 */
export function getDuration(duration: DurationPreset | number): number {
  if (typeof duration === "number") {
    return duration;
  }
  return DURATION[duration];
}

/**
 * Get easing value from preset name.
 * Returns the raw easing definition for use with motion/react.
 */
export function getEasing(easing: EasingPreset): (typeof EASING)[EasingPreset] {
  return EASING[easing];
}

/**
 * Get stagger delay value from preset name or custom number.
 */
export function getStaggerDelay(stagger: number | StaggerPreset): number {
  if (typeof stagger === "number") {
    return stagger;
  }
  return STAGGER[stagger];
}

/**
 * Check if easing is a spring configuration.
 */
export function isSpringEasing(
  easing: (typeof EASING)[EasingPreset],
): easing is (typeof EASING)["bounce"] | (typeof EASING)["spring"] {
  return typeof easing === "object" && "type" in easing;
}

/**
 * Create a transition object from timing presets.
 */
export function createTransition(options: MotionBaseProps) {
  const { delay = 0, duration = "normal", easing = "easeOut" } = options;
  const easingValue = getEasing(easing);

  if (isSpringEasing(easingValue)) {
    return {
      ...easingValue,
      delay,
    };
  }

  return {
    delay,
    duration: getDuration(duration),
    ease: easingValue,
  };
}
