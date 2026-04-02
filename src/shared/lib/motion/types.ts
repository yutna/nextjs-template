import type { MotionProps, Variants } from "motion/react";
import type { HTMLAttributes, RefObject } from "react";

/**
 * Standard animation variant names used across motion components.
 */
export type MotionVariantState = "exit" | "hidden" | "visible";

/**
 * Motion variants object with standard states.
 */
export type MotionVariants = Variants;

/**
 * Available preset variant names for quick selection.
 */
export type MotionPresetName =
  | "bounceIn"
  | "bounceInDown"
  | "bounceInUp"
  | "fadeIn"
  | "fadeInDown"
  | "fadeInLeft"
  | "fadeInRight"
  | "fadeInUp"
  | "flipInX"
  | "flipInY"
  | "scaleIn"
  | "scaleInDown"
  | "scaleInUp"
  | "slideInDown"
  | "slideInLeft"
  | "slideInRight"
  | "slideInUp";

/**
 * Duration preset names.
 */
export type DurationPreset = "fast" | "micro" | "normal" | "slow" | "slower";

/**
 * Easing preset names.
 */
export type EasingPreset =
  | "bounce"
  | "easeIn"
  | "easeInOut"
  | "easeOut"
  | "spring";

/**
 * Stagger delay preset names.
 */
export type StaggerPreset = "fast" | "normal" | "slow";

/**
 * Base props shared by all motion components.
 */
export interface MotionBaseProps {
  /**
   * Delay before animation starts in seconds.
   * @default 0
   */
  delay?: number;

  /**
   * Animation duration preset or custom value in seconds.
   * @default "normal"
   */
  duration?: DurationPreset | number;

  /**
   * Easing function preset.
   * @default "easeOut"
   */
  easing?: EasingPreset;
}

/**
 * Props for viewport-triggered animations.
 */
export interface MotionViewportProps {
  /**
   * Amount of element that must be visible to trigger animation.
   * @default 0.1
   */
  amount?: "all" | "some" | number;

  /**
   * Whether to animate only once when entering viewport.
   * @default true
   */
  once?: boolean;

  /**
   * Root element for intersection observer.
   */
  root?: RefObject<Element | null>;

  /**
   * Margin around root element.
   */
  margin?: string;
}

/**
 * Props for stagger container components.
 */
export interface StaggerProps {
  /**
   * Delay between each child animation.
   * Can be a preset name or custom value in seconds.
   * @default "normal"
   */
  staggerDelay?: number | StaggerPreset;

  /**
   * Whether to animate children in reverse order.
   * @default false
   */
  staggerReverse?: boolean;

  /**
   * Whether children should wait for parent animation to complete.
   * @default false
   */
  delayChildren?: number;
}

/**
 * Combined motion props for components with all features.
 */
export interface FullMotionProps
  extends MotionBaseProps,
    MotionViewportProps,
    StaggerProps {
  /**
   * Preset variant to use, or custom variants object.
   */
  variant?: MotionPresetName | MotionVariants;

  /**
   * Custom motion props to merge with defaults.
   */
  motionProps?: Omit<MotionProps, "animate" | "exit" | "initial" | "variants">;
}

/**
 * HTML element types that can be animated.
 */
export type MotionElementType =
  | "article"
  | "aside"
  | "div"
  | "footer"
  | "header"
  | "li"
  | "main"
  | "nav"
  | "ol"
  | "p"
  | "section"
  | "span"
  | "ul";

/**
 * Props for polymorphic motion components.
 */
export interface PolymorphicMotionProps<T extends MotionElementType = "div">
  extends FullMotionProps,
    Omit<HTMLAttributes<HTMLElement>, "style"> {
  /**
   * HTML element type to render.
   * @default "div"
   */
  as?: T;
}

/**
 * Text animation mode for character/word animations.
 */
export type TextAnimationMode = "characters" | "lines" | "words";

/**
 * Scroll progress event data.
 */
export interface ScrollProgressEvent {
  /**
   * Scroll progress from 0 to 1.
   */
  progress: number;

  /**
   * Current scroll position in pixels.
   */
  scrollY: number;

  /**
   * Scroll direction: -1 (up), 0 (none), 1 (down).
   */
  direction: -1 | 0 | 1;
}
