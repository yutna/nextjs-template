"use client";

import { motion } from "motion/react";

import { MOTION_REVEAL_VARIANTS } from "./constants";

import type { MotionRevealProps } from "./types";

export function MotionReveal({
  children,
  className,
  delay = 0,
  variant = "fadeInUp",
}: Readonly<MotionRevealProps>) {
  const selectedVariant = MOTION_REVEAL_VARIANTS[variant];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: selectedVariant.hidden,
        visible: {
          ...(selectedVariant.visible as Record<string, unknown>),
          transition: {
            ...((selectedVariant.visible as Record<string, unknown>)
              ?.transition as Record<string, unknown>),
            delay,
          },
        },
      }}
      className={className}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
