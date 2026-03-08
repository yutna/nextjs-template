"use client";

import { Box, HStack, Separator } from "@chakra-ui/react";

import { VibeControls } from "@/modules/static-pages/components/vibe-controls";
import { LOCALES } from "@/shared/constants/locale";
import { usePathname, useRouter } from "@/shared/lib/navigation";
import { ColorModeButton } from "@/shared/vendor/chakra-ui/color-mode";

import type { Locale } from "next-intl";
import type { PageChromeProps } from "./types";

export function PageChrome({ locale }: Readonly<PageChromeProps>) {
  const pathname = usePathname();
  const router = useRouter();

  function handleSwitch(next: Locale) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

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
        <VibeControls />
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
              onClick={() => handleSwitch(l)}
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
