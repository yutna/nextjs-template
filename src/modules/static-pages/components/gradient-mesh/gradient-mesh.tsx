"use client";

import { Box } from "@chakra-ui/react";
import { motion } from "motion/react";

const blobs = [
  {
    size: { base: "300px", md: "500px" },
    top: "-10%",
    left: "-5%",
    lightFrom: "purple.300",
    lightTo: "blue.300",
    darkFrom: "purple.900",
    darkTo: "blue.900",
    duration: 20,
  },
  {
    size: { base: "250px", md: "400px" },
    top: "30%",
    right: "-10%",
    lightFrom: "pink.300",
    lightTo: "purple.300",
    darkFrom: "pink.900",
    darkTo: "indigo.900",
    duration: 25,
  },
  {
    size: { base: "200px", md: "350px" },
    bottom: "10%",
    left: "20%",
    lightFrom: "cyan.300",
    lightTo: "blue.300",
    darkFrom: "cyan.900",
    darkTo: "blue.950",
    duration: 22,
  },
];

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
      {blobs.map((blob, i) => (
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
            top: typeof blob.top === "string" ? blob.top : undefined,
            left: typeof blob.left === "string" ? blob.left : undefined,
            right: typeof blob.right === "string" ? blob.right : undefined,
            bottom: typeof blob.bottom === "string" ? blob.bottom : undefined,
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
