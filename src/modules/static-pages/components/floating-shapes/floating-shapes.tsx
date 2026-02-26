"use client";

import { Box } from "@chakra-ui/react";
import { motion } from "motion/react";

import { FLOATING_SHAPES } from "./constants";

export function FloatingShapes() {
  return (
    <Box
      position="absolute"
      inset="0"
      overflow="hidden"
      pointerEvents="none"
      aria-hidden="true"
    >
      {FLOATING_SHAPES.map((shape, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -20, 10, -15, 0],
            x: [0, 10, -10, 5, 0],
            rotate: [0, 45, -20, 30, 0],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: shape.delay,
          }}
          style={{
            position: "absolute",
            top: shape.top,
            left: shape.left,
            right: shape.right,
            bottom: shape.bottom,
            willChange: "transform",
          }}
        >
          <Box
            w={`${shape.size}px`}
            h={`${shape.size}px`}
            borderRadius={shape.borderRadius}
            border="1px solid"
            borderColor={{ base: "purple.200", _dark: "purple.700" }}
            opacity={0.4}
            bg={{ base: "purple.100/20", _dark: "purple.800/20" }}
          />
        </motion.div>
      ))}
    </Box>
  );
}
