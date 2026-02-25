"use client";

import { motion, type Variants } from "motion/react";

import { type MotionRevealProps } from "./types";

const variants: Record<string, Variants> = {
  fadeInUp: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  },
};

export function MotionReveal({
  children,
  variant = "fadeInUp",
  delay = 0,
  className,
}: Readonly<MotionRevealProps>) {
  const selectedVariant = variants[variant];

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
