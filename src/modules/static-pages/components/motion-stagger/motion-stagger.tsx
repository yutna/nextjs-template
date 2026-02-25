"use client";

import { motion } from "motion/react";

import { type MotionStaggerProps } from "./types";

export function MotionStagger({
  children,
  staggerDelay = 0.1,
  className,
}: Readonly<MotionStaggerProps>) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
