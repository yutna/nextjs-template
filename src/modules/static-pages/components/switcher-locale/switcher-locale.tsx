"use client";

import { Box, HStack } from "@chakra-ui/react";

import { LOCALES } from "@/shared/constants/locale";
import { usePathname, useRouter } from "@/shared/lib/navigation";

import type { SwitcherLocaleProps } from "./types";
import type { Locale } from "next-intl";

export function SwitcherLocale({ locale }: Readonly<SwitcherLocaleProps>) {
  const pathname = usePathname();
  const router = useRouter();

  function handleSwitch(next: Locale) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <Box position="fixed" right={4} top={4} zIndex="overlay">
      <HStack
        backdropFilter="blur(8px)"
        bg={{ _dark: "gray.900/60", base: "white/80" }}
        border="1px solid"
        borderColor={{ _dark: "gray.700/60", base: "gray.200" }}
        borderRadius="full"
        gap={1}
        px={1}
        py={1}
      >
        {LOCALES.map((l) => {
          const isActive = l === locale;
          return (
            <Box
              _hover={
                isActive
                  ? {}
                  : { color: { _dark: "gray.100", base: "gray.800" } }
              }
              as="button"
              bgGradient={isActive ? "to-r" : undefined}
              borderRadius="full"
              color={
                isActive ? "white" : { _dark: "gray.400", base: "gray.500" }
              }
              cursor={isActive ? "default" : "pointer"}
              fontSize="xs"
              fontWeight="semibold"
              gradientFrom={isActive ? "blue.500" : undefined}
              gradientTo={isActive ? "purple.500" : undefined}
              key={l}
              letterSpacing="wide"
              onClick={() => handleSwitch(l)}
              px={3}
              py={1}
              transition="all 0.2s ease"
              userSelect="none"
            >
              {l.toUpperCase()}
            </Box>
          );
        })}
      </HStack>
    </Box>
  );
}
