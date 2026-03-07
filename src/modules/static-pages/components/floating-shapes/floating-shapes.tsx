"use client";

import { Box } from "@chakra-ui/react";
import { motion } from "motion/react";

import { FLOATING_SHAPES } from "./constants";

export function FloatingShapes() {
  return (
    <Box
      aria-hidden="true"
      inset="0"
      overflow="hidden"
      pointerEvents="none"
      position="absolute"
    >
      {FLOATING_SHAPES.map((shape, i) => (
        <motion.div
          animate={{
            rotate: [0, 45, -20, 30, 0],
            x: [0, 10, -10, 5, 0],
            y: [0, -20, 10, -15, 0],
          }}
          key={i}
          style={{
            bottom: shape.bottom,
            left: shape.left,
            position: "absolute",
            right: shape.right,
            top: shape.top,
            willChange: "transform",
          }}
          transition={{
            delay: shape.delay,
            duration: shape.duration,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          <Box
            bg={{ _dark: "purple.800/20", base: "purple.100/20" }}
            border="1px solid"
            borderColor={{ _dark: "purple.700", base: "purple.200" }}
            borderRadius={shape.borderRadius}
            h={`${shape.size}px`}
            opacity={0.4}
            w={`${shape.size}px`}
          />
        </motion.div>
      ))}
    </Box>
  );
}
