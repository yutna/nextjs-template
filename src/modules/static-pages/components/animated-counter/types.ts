import { type TextProps } from "@chakra-ui/react";

export interface AnimatedCounterProps extends Omit<TextProps, "children"> {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}
