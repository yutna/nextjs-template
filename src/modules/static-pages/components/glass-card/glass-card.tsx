import { Box } from "@chakra-ui/react";

import type { GlassCardProps } from "./types";

export function GlassCard({ children, ...props }: Readonly<GlassCardProps>) {
  return (
    <Box
      backdropFilter="blur(16px)"
      bg={{ base: "white/60", _dark: "gray.900/40" }}
      border="1px solid"
      borderColor={{ base: "white/80", _dark: "gray.700/50" }}
      borderRadius="2xl"
      boxShadow={{ base: "lg", _dark: "dark-lg" }}
      p={{ base: 6, md: 8 }}
      transition="all 0.3s ease"
      _hover={{
        boxShadow: "xl",
        borderColor: { base: "purple.200", _dark: "purple.700/50" },
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
