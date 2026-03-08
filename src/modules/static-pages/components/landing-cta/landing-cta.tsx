import "server-only";

import { Box, Button, Text, VStack } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";
import { LuGithub } from "react-icons/lu";

import { HERO_INSTALL_COMMAND } from "@/modules/static-pages/components/copy-command";
import { MotionReveal } from "@/modules/static-pages/components/motion-reveal";

import type { LandingCtaProps } from "./types";

export async function LandingCta({ locale }: Readonly<LandingCtaProps>) {
  const t = await getTranslations({
    locale,
    namespace: "modules.staticPages.components.landingCta",
  });

  return (
    <Box
      as="section"
      bg={{ _dark: "gray.900", base: "gray.50" }}
      px={{ base: 6, md: 8 }}
      py={{ base: 20, md: 28 }}
    >
      <VStack gap={{ base: 6, md: 8 }} maxW="2xl" mx="auto" textAlign="center">
        <MotionReveal>
          <Text
            as="h2"
            color={{ _dark: "white", base: "gray.900" }}
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="extrabold"
            letterSpacing="tight"
          >
            {t("heading")}
          </Text>
        </MotionReveal>

        <MotionReveal delay={0.1}>
          <Text
            color={{ _dark: "gray.400", base: "gray.600" }}
            fontSize={{ base: "sm", md: "md" }}
          >
            {t("subheading")}
          </Text>
        </MotionReveal>

        <MotionReveal delay={0.2}>
          <Button
            _hover={{ bg: { _dark: "gray.200", base: "gray.700" } }}
            asChild
            bg={{ _dark: "white", base: "gray.900" }}
            color={{ _dark: "gray.900", base: "white" }}
            px={6}
            size="md"
          >
            <a
              href="https://github.com/yutna/nextjs-template"
              rel="noopener noreferrer"
              target="_blank"
            >
              <LuGithub />
              {t("buttonGitHub")}
            </a>
          </Button>
        </MotionReveal>

        <MotionReveal delay={0.3}>
          <VStack gap={2}>
            <Text color={{ _dark: "gray.500", base: "gray.400" }} fontSize="xs">
              {t("orRun")}
            </Text>
            <Box
              bg={{ _dark: "gray.800", base: "gray.100" }}
              border="1px solid"
              borderColor={{ _dark: "gray.700", base: "gray.200" }}
              borderRadius="md"
              color={{ _dark: "gray.400", base: "gray.600" }}
              fontFamily="mono"
              fontSize="xs"
              overflowX="auto"
              px={4}
              py={2}
              whiteSpace="nowrap"
            >
              {HERO_INSTALL_COMMAND}
            </Box>
          </VStack>
        </MotionReveal>
      </VStack>
    </Box>
  );
}
