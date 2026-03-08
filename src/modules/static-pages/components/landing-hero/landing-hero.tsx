import "server-only";

import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";
import { LuGithub } from "react-icons/lu";

import { CopyCommand } from "@/modules/static-pages/components/copy-command";
import { MotionReveal } from "@/modules/static-pages/components/motion-reveal";
import { ScrollIndicator } from "@/modules/static-pages/components/scroll-indicator";
import { VibeBackground } from "@/modules/static-pages/components/vibe-background";

import type { LandingHeroProps } from "./types";

export async function LandingHero({ locale }: Readonly<LandingHeroProps>) {
  const t = await getTranslations({
    locale,
    namespace: "modules.staticPages.components.landingHero",
  });

  return (
    <Box
      alignItems="center"
      as="section"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      minH="100vh"
      position="relative"
    >
      <VibeBackground />
      <VStack
        data-vibe-hero=""
        gap={{ base: 6, md: 8 }}
        maxW="3xl"
        position="relative"
        px={{ base: 6, md: 8 }}
        textAlign="center"
        w="full"
        zIndex={1}
      >
        {/* Mono label badge */}
        <MotionReveal delay={0}>
          <VStack gap={2}>
            <Box
              bg={{ _dark: "blue.400", base: "blue.600" }}
              borderRadius="full"
              h="2px"
              mx="auto"
              w="8"
            />
            <Box
              color={{ _dark: "gray.400", base: "gray.500" }}
              fontFamily="mono"
              fontSize="xs"
              letterSpacing="widest"
              textTransform="uppercase"
            >
              Next.js 16 Template
            </Box>
          </VStack>
        </MotionReveal>

        {/* Main heading */}
        <MotionReveal delay={0.1}>
          <Heading
            as="h1"
            color={{ _dark: "white", base: "gray.900" }}
            fontSize={{ base: "4xl", lg: "7xl", md: "6xl" }}
            fontWeight="extrabold"
            letterSpacing="tight"
            lineHeight="1"
            whiteSpace="pre-line"
          >
            {t("title")}
          </Heading>
        </MotionReveal>

        {/* Subtitle */}
        <MotionReveal delay={0.2}>
          <Text
            color={{ _dark: "gray.400", base: "gray.600" }}
            fontSize={{ base: "md", md: "lg" }}
            lineHeight="tall"
            maxW="xl"
            mx="auto"
          >
            {t("subtitle")}
          </Text>
        </MotionReveal>

        {/* Copy command */}
        <MotionReveal delay={0.3}>
          <CopyCommand />
        </MotionReveal>

        {/* GitHub button */}
        <MotionReveal delay={0.4}>
          <Button
            _hover={{ borderColor: "blue.500", color: "blue.500" }}
            asChild
            borderColor={{ _dark: "gray.700", base: "gray.300" }}
            color={{ _dark: "gray.300", base: "gray.700" }}
            variant="outline"
          >
            <a
              href="https://github.com/yutna/nextjs-template"
              rel="noopener noreferrer"
              target="_blank"
            >
              <LuGithub />
              {t("getStarted")}
            </a>
          </Button>
        </MotionReveal>
      </VStack>

      <ScrollIndicator />
    </Box>
  );
}
