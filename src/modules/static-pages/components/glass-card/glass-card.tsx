import { Box } from "@chakra-ui/react";

import type { GlassCardProps } from "./types";

export function GlassCard({ children, ...props }: Readonly<GlassCardProps>) {
  return (
    <Box
      _hover={{
        borderColor: { _dark: "purple.700/50", base: "purple.200" },
        boxShadow: "xl",
      }}
      backdropFilter="blur(16px)"
      bg={{ _dark: "gray.900/40", base: "white/60" }}
      border="1px solid"
      borderColor={{ _dark: "gray.700/50", base: "white/80" }}
      borderRadius="2xl"
      boxShadow={{ _dark: "dark-lg", base: "lg" }}
      p={{ base: 6, md: 8 }}
      transition="all 0.3s ease"
      {...props}
    >
      {children}
    </Box>
  );
}
