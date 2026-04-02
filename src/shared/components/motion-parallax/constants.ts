import type { ScrollOffset } from "@/shared/components/motion-scroll";

/**
 * Default scroll offset configuration for parallax.
 * "start end" means animation starts when element's start meets viewport's end.
 * "end start" means animation ends when element's end meets viewport's start.
 */
export const DEFAULT_OFFSET: ScrollOffset = ["start end", "end start"];

/**
 * Default parallax speed.
 */
export const DEFAULT_PARALLAX_SPEED = 0.5;
