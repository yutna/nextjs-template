import "server-only";

import { Box, Flex, Text } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

import type { LandingFooterProps } from "./types";

export async function LandingFooter({ locale }: Readonly<LandingFooterProps>) {
  const t = await getTranslations({
    locale,
    namespace: "modules.staticPages.components.landingFooter",
  });

  return (
    <Box
      as="footer"
      bg={{ _dark: "gray.950", base: "white" }}
      borderColor={{ _dark: "gray.800", base: "gray.200" }}
      borderTop="1px solid"
      px={{ base: 6, md: 8 }}
      py={8}
    >
      <Flex
        align="center"
        flexDirection={{ base: "column", md: "row" }}
        gap={{ base: 3, md: 4 }}
        justify={{ base: "center", md: "space-between" }}
        maxW="5xl"
        mx="auto"
        textAlign={{ base: "center", md: "left" }}
      >
        <Text
          color={{ _dark: "gray.500", base: "gray.400" }}
          fontSize="xs"
        >
          {t("copyright", { year: new Date().getFullYear() })}
        </Text>

        <Text
          color={{ _dark: "gray.600", base: "gray.400" }}
          display={{ base: "none", md: "block" }}
          fontSize="xs"
        >
          {t("builtWith")}
        </Text>

        <Box
          _hover={{ color: { _dark: "white", base: "gray.700" } }}
          asChild
          color={{ _dark: "gray.500", base: "gray.400" }}
          fontSize="xs"
          transition="color 0.2s ease"
        >
          <a
            href="https://github.com/yutna/nextjs-template"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t("github")} ↗
          </a>
        </Box>
      </Flex>
    </Box>
  );
}
