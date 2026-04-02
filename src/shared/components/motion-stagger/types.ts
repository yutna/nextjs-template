import type { ReactNode, RefObject } from "react";
import type {
  DurationPreset,
  EasingPreset,
  MotionElementType,
  MotionPresetName,
  MotionVariants,
  StaggerPreset,
} from "@/shared/lib/motion";

/**
 * Props for the MotionStagger component.
 */
export interface MotionStaggerProps {
  /**
   * Children to animate with stagger effect.
   * Each direct child will be wrapped in an animated container.
   */
  children: ReactNode;

  /**
   * HTML element type for the container.
   * @default "div"
   */
  as?: MotionElementType;

  /**
   * Animation variant for child items.
   * @default "fadeInUp"
   */
  itemVariant?: MotionPresetName | MotionVariants;

  /**
   * Delay between each child animation.
   * @default "normal"
   */
  staggerDelay?: number | StaggerPreset;

  /**
   * Whether to animate children in reverse order.
   * @default false
   */
  staggerReverse?: boolean;

  /**
   * Delay before first child starts animating.
   * @default 0
   */
  delayChildren?: number;

  /**
   * Animation duration for each child.
   * @default "normal"
   */
  duration?: DurationPreset | number;

  /**
   * Easing function for child animations.
   * @default "easeOut"
   */
  easing?: EasingPreset;

  /**
   * Whether to animate only once when entering viewport.
   * @default true
   */
  once?: boolean;

  /**
   * Amount of container that must be visible to trigger animation.
   * @default 0.1
   */
  amount?: "all" | "some" | number;

  /**
   * Root element for intersection observer.
   */
  root?: RefObject<Element | null>;

  /**
   * Margin around root element for intersection observer.
   */
  margin?: string;

  /**
   * Whether animation is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * HTML element type for child wrappers.
   * @default "div"
   */
  itemAs?: MotionElementType;

  /**
   * Class name to apply to each item wrapper.
   */
  itemClassName?: string;

  /**
   * CSS class name for the container.
   */
  className?: string;
}
