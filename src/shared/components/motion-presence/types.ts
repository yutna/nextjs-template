import type { ReactNode } from "react";

/**
 * Props for the MotionPresence component.
 */
export interface MotionPresenceProps {
  /**
   * Children to animate on mount/unmount.
   * Should contain motion components with exit variants.
   */
  children: ReactNode;

  /**
   * Whether to wait for exit animation to complete before removing from DOM.
   * @default true
   */
  exitBeforeEnter?: boolean;

  /**
   * Whether to only render one child at a time.
   * When true, entering children will wait for exiting children to finish.
   * @default false
   */
  mode?: "popLayout" | "sync" | "wait";

  /**
   * Callback when all exit animations complete.
   */
  onExitComplete?: () => void;

  /**
   * Initial animation state. Set to false to disable initial animation.
   * @default true
   */
  initial?: boolean;
}
