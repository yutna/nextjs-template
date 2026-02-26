import type { TextProps } from "@chakra-ui/react";

export interface AnimatedCounterProps extends Omit<TextProps, "children"> {
  target: number;

  duration?: number;
  prefix?: string;
  suffix?: string;
}
