"use client";

import { Text } from "@chakra-ui/react";
import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";
import { useImmer } from "use-immer";

import type { AnimatedCounterProps } from "./types";

export function AnimatedCounter({
  duration = 2,
  prefix = "",
  suffix = "",
  target,
  ...props
}: Readonly<AnimatedCounterProps>) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [state, updateState] = useImmer({ displayValue: 0 });

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate(value) {
        updateState((draft) => {
          draft.displayValue = Math.round(value);
        });
      },
    });

    return () => controls.stop();
  }, [isInView, target, duration, updateState]);

  return (
    <Text ref={ref} {...props}>
      {prefix}
      {state.displayValue}
      {suffix}
    </Text>
  );
}
