import type { RefObject } from "react";
import type {
  MotionPresetName,
  MotionVariants,
  StaggerPreset,
  TextAnimationMode,
} from "@/shared/lib/motion";

/**
 * Props for the MotionText component.
 */
export interface MotionTextProps {
  /**
   * Text content to animate.
   */
  children: string;

  /**
   * Animation mode determining how text is split.
   * @default "words"
   */
  mode?: TextAnimationMode;

  /**
   * Animation variant for each text segment.
   * @default "fadeInUp"
   */
  variant?: MotionPresetName | MotionVariants;

  /**
   * Delay between each segment animation.
   * @default "fast"
   */
  staggerDelay?: number | StaggerPreset;

  /**
   * Delay before animation starts.
   * @default 0
   */
  delay?: number;

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
   * Margin around root element.
   */
  margin?: string;

  /**
   * Whether animation is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * HTML element type for the container.
   * @default "span"
   */
  as?: "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

  /**
   * Whether to preserve whitespace between words.
   * @default true
   */
  preserveWhitespace?: boolean;

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
