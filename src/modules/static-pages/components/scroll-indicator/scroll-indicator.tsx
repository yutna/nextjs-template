"use client";

import { Box } from "@chakra-ui/react";
import { motion } from "motion/react";
import { LuChevronDown } from "react-icons/lu";

export function ScrollIndicator() {
  return (
    <Box position="absolute" bottom="8" left="50%" transform="translateX(-50%)">
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ willChange: "transform" }}
      >
        <Box
          as={LuChevronDown}
          w="6"
          h="6"
          color={{ base: "gray.400", _dark: "gray.500" }}
        />
      </motion.div>
    </Box>
  );
}
