import { DURATION, EASING, STAGGER } from "./timing";

import type { MotionPresetName, MotionVariants } from "./types";

/**
 * Fade variants - simple opacity transitions.
 */
export const fadeIn: MotionVariants = {
  exit: {
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
  },
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.normal, ease: EASING.easeOut },
  },
};

export const fadeInUp: MotionVariants = {
  exit: {
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
    y: 20,
  },
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.normal, ease: EASING.easeOut },
    y: 0,
  },
};

export const fadeInDown: MotionVariants = {
  exit: {
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
    y: -20,
  },
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.normal, ease: EASING.easeOut },
    y: 0,
  },
};

export const fadeInLeft: MotionVariants = {
  exit: {
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
    x: -20,
  },
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.normal, ease: EASING.easeOut },
    x: 0,
  },
};

export const fadeInRight: MotionVariants = {
  exit: {
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
    x: 20,
  },
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.normal, ease: EASING.easeOut },
    x: 0,
  },
};

/**
 * Scale variants - size transitions with optional movement.
 */
export const scaleIn: MotionVariants = {
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
  },
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.normal, ease: EASING.easeOut },
  },
};

export const scaleInUp: MotionVariants = {
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
    y: 10,
  },
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.normal, ease: EASING.easeOut },
    y: 0,
  },
};

export const scaleInDown: MotionVariants = {
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
    y: -10,
  },
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.normal, ease: EASING.easeOut },
    y: 0,
  },
};

/**
 * Slide variants - full directional slides.
 */
export const slideInLeft: MotionVariants = {
  exit: {
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
    x: -50,
  },
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.normal, ease: EASING.easeOut },
    x: 0,
  },
};

export const slideInRight: MotionVariants = {
  exit: {
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
    x: 50,
  },
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.normal, ease: EASING.easeOut },
    x: 0,
  },
};

export const slideInUp: MotionVariants = {
  exit: {
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
    y: 50,
  },
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.normal, ease: EASING.easeOut },
    y: 0,
  },
};

export const slideInDown: MotionVariants = {
  exit: {
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
    y: -50,
  },
  hidden: { opacity: 0, y: -50 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.normal, ease: EASING.easeOut },
    y: 0,
  },
};

/**
 * Bounce variants - spring-based playful animations.
 */
export const bounceIn: MotionVariants = {
  exit: {
    opacity: 0,
    scale: 0.3,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
  },
  hidden: { opacity: 0, scale: 0.3 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: EASING.bounce,
  },
};

export const bounceInUp: MotionVariants = {
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
    y: 30,
  },
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: EASING.bounce,
    y: 0,
  },
};

export const bounceInDown: MotionVariants = {
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
    y: -30,
  },
  hidden: { opacity: 0, scale: 0.9, y: -30 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: EASING.bounce,
    y: 0,
  },
};

/**
 * Flip variants - 3D rotation effects.
 */
export const flipInX: MotionVariants = {
  exit: {
    opacity: 0,
    rotateX: 90,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
  },
  hidden: { opacity: 0, rotateX: -90 },
  visible: {
    opacity: 1,
    rotateX: 0,
    transition: { duration: DURATION.slow, ease: EASING.easeOut },
  },
};

export const flipInY: MotionVariants = {
  exit: {
    opacity: 0,
    rotateY: 90,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
  },
  hidden: { opacity: 0, rotateY: -90 },
  visible: {
    opacity: 1,
    rotateY: 0,
    transition: { duration: DURATION.slow, ease: EASING.easeOut },
  },
};

/**
 * Stagger container variants.
 * Use with staggerChildren in transition.
 */
export const staggerContainer: MotionVariants = {
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: STAGGER.fast,
      staggerDirection: -1,
    },
  },
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0,
      staggerChildren: STAGGER.normal,
    },
  },
};

/**
 * Stagger item variants - use as children of staggerContainer.
 */
export const staggerItem: MotionVariants = {
  exit: {
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
    y: 20,
  },
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.normal, ease: EASING.easeOut },
    y: 0,
  },
};

/**
 * Map of all preset variants by name.
 */
export const VARIANTS: Record<MotionPresetName, MotionVariants> = {
  bounceIn,
  bounceInDown,
  bounceInUp,
  fadeIn,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  fadeInUp,
  flipInX,
  flipInY,
  scaleIn,
  scaleInDown,
  scaleInUp,
  slideInDown,
  slideInLeft,
  slideInRight,
  slideInUp,
};

/**
 * Get a preset variant by name, or return custom variants as-is.
 */
export function getVariant(
  variant: MotionPresetName | MotionVariants,
): MotionVariants {
  if (typeof variant === "string") {
    return VARIANTS[variant];
  }
  return variant;
}

/**
 * Create stagger container variants with custom timing.
 */
export function createStaggerContainer(options?: {
  delayChildren?: number;
  staggerDelay?: number;
  staggerReverse?: boolean;
}): MotionVariants {
  const {
    delayChildren = 0,
    staggerDelay = STAGGER.normal,
    staggerReverse = false,
  } = options ?? {};

  return {
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: staggerDelay / 2,
        staggerDirection: -1,
      },
    },
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren,
        staggerChildren: staggerDelay,
        staggerDirection: staggerReverse ? -1 : 1,
      },
    },
  };
}
