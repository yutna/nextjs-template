import type { ReactNode } from "react";
import type { MotionElementType } from "@/shared/lib/motion";

/**
 * Props for scroll-linked parallax effect.
 */
export interface MotionParallaxProps {
  /**
   * Content to apply parallax effect to.
   */
  children: ReactNode;

  /**
   * Parallax speed multiplier.
   * Positive values move slower than scroll, negative values move faster.
   * @default 0.5
   */
  speed?: number;

  /**
   * HTML element type to render.
   * @default "div"
   */
  as?: MotionElementType;

  /**
   * Class name for the container.
   */
  className?: string;

  /**
   * Whether parallax is disabled.
   * @default false
   */
  disabled?: boolean;
}
