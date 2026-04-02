import type { ReactNode, RefObject } from "react";
import type {
  DurationPreset,
  EasingPreset,
  MotionElementType,
  MotionPresetName,
  MotionVariants,
} from "@/shared/lib/motion";

/**
 * Props for the MotionReveal component.
 */
export interface MotionRevealProps {
  /**
   * Content to animate.
   */
  children: ReactNode;

  /**
   * HTML element type to render.
   * @default "div"
   */
  as?: MotionElementType;

  /**
   * Animation variant preset name or custom variants object.
   * @default "fadeInUp"
   */
  variant?: MotionPresetName | MotionVariants;

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

  /**
   * Whether to animate only once when entering viewport.
   * @default true
   */
  once?: boolean;

  /**
   * Amount of element that must be visible to trigger animation.
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
   * Useful for conditional animations.
   * @default false
   */
  disabled?: boolean;

  /**
   * CSS class name for the container.
   */
  className?: string;

  /**
   * Test ID for testing.
   */
  "data-testid"?: string;

  /**
   * Accessible label.
   */
  "aria-label"?: string;
}
