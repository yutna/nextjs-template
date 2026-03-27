"use client";

import { Box } from "@chakra-ui/react";
import { motion } from "motion/react";
import { LuChevronDown } from "react-icons/lu";

export function ScrollIndicator() {
  return (
    <Box bottom="8" left="50%" position="absolute" transform="translateX(-50%)" zIndex={1}>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        // eslint-disable-next-line project/no-inline-style -- motion animation performance hint
        style={{ willChange: "transform" }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <Box
          as={LuChevronDown}
          color={{ _dark: "gray.500", base: "gray.400" }}
          h="6"
          w="6"
        />
      </motion.div>
    </Box>
  );
}
