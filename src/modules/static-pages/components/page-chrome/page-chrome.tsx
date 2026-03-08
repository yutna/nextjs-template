"use client";

import { Box, HStack, Separator } from "@chakra-ui/react";

import { LOCALES } from "@/shared/constants/locale";
import { ColorModeButton } from "@/shared/vendor/chakra-ui/color-mode";

import type { PageChromeProps } from "./types";

export function PageChrome({
  children,
  locale,
  onLocaleSwitch,
}: Readonly<PageChromeProps>) {
  return (
    <Box position="fixed" right={4} top={4} zIndex="overlay">
      <HStack
        bg={{ _dark: "gray.900", base: "white" }}
        border="1px solid"
        borderColor={{ _dark: "gray.700", base: "gray.200" }}
        borderRadius="full"
        gap={1}
        px={1}
        py={1}
      >
        {children}
        {LOCALES.map((l) => {
          const isActive = l === locale;
          return (
            <Box
              _hover={
                isActive ? {} : { bg: { _dark: "gray.800", base: "gray.100" } }
              }
              as="button"
              bg={
                isActive ? { _dark: "gray.700", base: "gray.100" } : undefined
              }
              borderRadius="full"
              color={
                isActive
                  ? { _dark: "white", base: "gray.900" }
                  : { _dark: "gray.400", base: "gray.500" }
              }
              cursor={isActive ? "default" : "pointer"}
              fontSize="xs"
              fontWeight="semibold"
              key={l}
              letterSpacing="wide"
              onClick={() => onLocaleSwitch(l)}
              px={3}
              py={1}
              transition="all 0.15s ease"
              userSelect="none"
            >
              {l.toUpperCase()}
            </Box>
          );
        })}
        <Separator
          borderColor={{ _dark: "gray.700", base: "gray.200" }}
          height="5"
          orientation="vertical"
        />
        <ColorModeButton size="xs" variant="ghost" />
      </HStack>
    </Box>
  );
}
