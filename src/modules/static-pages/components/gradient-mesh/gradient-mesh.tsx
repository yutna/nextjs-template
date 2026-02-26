"use client";

import { Box } from "@chakra-ui/react";
import { motion } from "motion/react";

import { GRADIENT_MESH_BLOBS } from "./constants";

export function GradientMesh() {
  return (
    <Box
      position="fixed"
      inset="0"
      zIndex={-1}
      pointerEvents="none"
      overflow="hidden"
      aria-hidden="true"
    >
      {GRADIENT_MESH_BLOBS.map((blob, i) => (
        <motion.div
          key={i}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -25, 15, -10, 0],
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top: blob.top,
            left: blob.left,
            right: blob.right,
            bottom: blob.bottom,
            willChange: "transform",
          }}
        >
          <Box
            w={blob.size}
            h={blob.size}
            borderRadius="full"
            bgGradient="to-br"
            gradientFrom={{
              base: blob.lightFrom,
              _dark: blob.darkFrom,
            }}
            gradientTo={{
              base: blob.lightTo,
              _dark: blob.darkTo,
            }}
            filter="blur(80px)"
            opacity={{ base: 0.3, _dark: 0.15 }}
          />
        </motion.div>
      ))}
    </Box>
  );
}
