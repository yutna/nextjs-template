// Reduced motion utilities
export {
  getMotionDataAttrs,
  getReducedMotionVariant,
  MOTION_DATA_ATTR,
  prefersReducedMotion,
  reducedMotionCSS,
  useMotionPreference,
  useReducedMotion,
} from "./reduced-motion";
// Timing constants and utilities
export {
  createTransition,
  DURATION,
  EASING,
  getDuration,
  getEasing,
  getStaggerDelay,
  isSpringEasing,
  STAGGER,
} from "./timing";
// Variants
export {
  bounceIn,
  bounceInDown,
  bounceInUp,
  createStaggerContainer,
  fadeIn,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  fadeInUp,
  flipInX,
  flipInY,
  getVariant,
  scaleIn,
  scaleInDown,
  scaleInUp,
  slideInDown,
  slideInLeft,
  slideInRight,
  slideInUp,
  staggerContainer,
  staggerItem,
  VARIANTS,
} from "./variants";

// Types
export type {
  DurationPreset,
  EasingPreset,
  FullMotionProps,
  MotionBaseProps,
  MotionElementType,
  MotionPresetName,
  MotionVariants,
  MotionVariantState,
  MotionViewportProps,
  PolymorphicMotionProps,
  ScrollProgressEvent,
  StaggerPreset,
  StaggerProps,
  TextAnimationMode,
} from "./types";
