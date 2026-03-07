"use client";

import { Box } from "@chakra-ui/react";
import { motion } from "motion/react";

import { GRADIENT_MESH_BLOBS } from "./constants";

export function GradientMesh() {
  return (
    <Box
      aria-hidden="true"
      inset="0"
      overflow="hidden"
      pointerEvents="none"
      position="fixed"
      zIndex={-1}
    >
      {GRADIENT_MESH_BLOBS.map((blob, i) => (
        <motion.div
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -25, 15, -10, 0],
          }}
          key={i}
          style={{
            bottom: blob.bottom,
            left: blob.left,
            position: "absolute",
            right: blob.right,
            top: blob.top,
            willChange: "transform",
          }}
          transition={{
            duration: blob.duration,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          <Box
            bgGradient="to-br"
            borderRadius="full"
            filter="blur(80px)"
            gradientFrom={{
              _dark: blob.darkFrom,
              base: blob.lightFrom,
            }}
            gradientTo={{
              _dark: blob.darkTo,
              base: blob.lightTo,
            }}
            h={blob.size}
            opacity={{ _dark: 0.15, base: 0.3 }}
            w={blob.size}
          />
        </motion.div>
      ))}
    </Box>
  );
}
