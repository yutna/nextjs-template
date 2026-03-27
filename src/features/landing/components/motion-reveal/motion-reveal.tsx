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
      className={className}
      initial="hidden"
      // eslint-disable-next-line project/no-inline-style -- motion animation performance hint
      style={{ willChange: "transform, opacity" }}
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
      viewport={{ amount: 0.3, once: true }}
      whileInView="visible"
    >
      {children}
    </motion.div>
  );
}
