"use client";

import { motion } from "motion/react";

import type { MotionStaggerProps } from "./types";

export function MotionStagger({
  children,
  className,
  staggerDelay = 0.1,
}: Readonly<MotionStaggerProps>) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      viewport={{ amount: 0.2, once: true }}
      whileInView="visible"
    >
      {children}
    </motion.div>
  );
}
