import type { ScrollOffset } from "./types";

/**
 * Default scroll offset configuration.
 * "start end" means animation starts when element's start meets viewport's end.
 * "end start" means animation ends when element's end meets viewport's start.
 */
export const DEFAULT_OFFSET: ScrollOffset = ["start end", "end start"];
