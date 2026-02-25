"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";
import { Text } from "@chakra-ui/react";

import { type AnimatedCounterProps } from "./types";

export function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  duration = 2,
  ...textProps
}: Readonly<AnimatedCounterProps>) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate(value) {
        setDisplayValue(Math.round(value));
      },
    });

    return () => controls.stop();
  }, [isInView, target, duration]);

  return (
    <Text ref={ref} {...textProps}>
      {prefix}
      {displayValue}
      {suffix}
    </Text>
  );
}
