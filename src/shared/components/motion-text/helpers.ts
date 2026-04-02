import type { TextAnimationMode } from "@/shared/lib/motion";

/**
 * Split text into segments based on animation mode.
 */
export function splitText(text: string, mode: TextAnimationMode): string[] {
  switch (mode) {
    case "characters":
      return text.split("");
    case "words":
      return text.split(/(\s+)/).filter(Boolean);
    case "lines":
      return text.split(/\n/).filter(Boolean);
    default:
      return [text];
  }
}

/**
 * Check if a segment is whitespace.
 */
export function isWhitespace(segment: string): boolean {
  return /^\s+$/.test(segment);
}
