"use client";

import { Box } from "@chakra-ui/react";
import { motion } from "motion/react";

const shapes = [
  {
    size: 12,
    top: "15%",
    left: "8%",
    duration: 18,
    delay: 0,
    borderRadius: "full",
  },
  {
    size: 8,
    top: "25%",
    right: "12%",
    duration: 22,
    delay: 2,
    borderRadius: "md",
  },
  {
    size: 16,
    bottom: "30%",
    left: "5%",
    duration: 20,
    delay: 1,
    borderRadius: "full",
  },
  {
    size: 6,
    top: "60%",
    right: "8%",
    duration: 16,
    delay: 3,
    borderRadius: "lg",
  },
  {
    size: 10,
    bottom: "15%",
    right: "20%",
    duration: 24,
    delay: 0.5,
    borderRadius: "full",
  },
];

export function FloatingShapes() {
  return (
    <Box
      position="absolute"
      inset="0"
      overflow="hidden"
      pointerEvents="none"
      aria-hidden="true"
    >
      {shapes.map((shape, i) => (
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
