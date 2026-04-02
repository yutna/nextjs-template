import type { UseScrollOptions } from "motion/react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import type { MotionElementType } from "@/shared/lib/motion";

/**
 * Scroll offset type from motion library.
 */
export type ScrollOffset = UseScrollOptions["offset"];

/**
 * Scroll progress callback data.
 */
export interface ScrollProgressData {
  /**
   * Scroll progress from 0 to 1.
   */
  progress: number;

  /**
   * Scroll progress value for use in motion transforms.
   */
  scrollYProgress: number;
}

/**
 * Props for the MotionScroll component.
 */
export interface MotionScrollProps {
  /**
   * Content to animate based on scroll.
   * Can be a ReactNode or a render function receiving scroll progress.
   */
  children: ((data: ScrollProgressData) => ReactNode) | ReactNode;

  /**
   * HTML element type to render.
   * @default "div"
   */
  as?: MotionElementType;

  /**
   * Target element for scroll tracking.
   * Defaults to the component's container element.
   */
  target?: RefObject<HTMLElement | null>;

  /**
   * Scroll offset configuration.
   * @default ["start end", "end start"]
   */
  offset?: ScrollOffset;

  /**
   * CSS properties to animate based on scroll progress.
   * Each property maps from [start, end] values.
   */
  style?: {
    opacity?: [number, number];
    rotate?: [number, number];
    scale?: [number, number];
    x?: [number | string, number | string];
    y?: [number | string, number | string];
  };

  /**
   * Additional static styles.
   */
  staticStyle?: CSSProperties;

  /**
   * Class name for the container.
   */
  className?: string;

  /**
   * Whether animation is disabled.
   * @default false
   */
  disabled?: boolean;
}
