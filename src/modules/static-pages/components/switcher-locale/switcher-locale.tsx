"use client";

import { Box, HStack } from "@chakra-ui/react";

import { LOCALES } from "@/shared/constants/locale";
import { usePathname, useRouter } from "@/shared/lib/navigation";

import type { Locale } from "next-intl";
import type { SwitcherLocaleProps } from "./types";

export function SwitcherLocale({ locale }: Readonly<SwitcherLocaleProps>) {
  const pathname = usePathname();
  const router = useRouter();

  function handleSwitch(next: Locale) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <Box position="fixed" top={4} right={4} zIndex="overlay">
      <HStack
        gap={1}
        px={1}
        py={1}
        borderRadius="full"
        border="1px solid"
        borderColor={{ base: "gray.200", _dark: "gray.700/60" }}
        bg={{ base: "white/80", _dark: "gray.900/60" }}
        backdropFilter="blur(8px)"
      >
        {LOCALES.map((l) => {
          const isActive = l === locale;
          return (
            <Box
              key={l}
              as="button"
              onClick={() => handleSwitch(l)}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="semibold"
              letterSpacing="wide"
              transition="all 0.2s ease"
              cursor={isActive ? "default" : "pointer"}
              userSelect="none"
              bgGradient={isActive ? "to-r" : undefined}
              gradientFrom={isActive ? "blue.500" : undefined}
              gradientTo={isActive ? "purple.500" : undefined}
              color={
                isActive ? "white" : { base: "gray.500", _dark: "gray.400" }
              }
              _hover={
                isActive
                  ? {}
                  : { color: { base: "gray.800", _dark: "gray.100" } }
              }
            >
              {l.toUpperCase()}
            </Box>
          );
        })}
      </HStack>
    </Box>
  );
}
