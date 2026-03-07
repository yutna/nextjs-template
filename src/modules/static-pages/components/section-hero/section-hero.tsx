import "server-only";

import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

import { FloatingShapes } from "@/modules/static-pages/components/floating-shapes";
import { MotionReveal } from "@/modules/static-pages/components/motion-reveal";
import { ScrollIndicator } from "@/modules/static-pages/components/scroll-indicator";

import { CopyCommand } from "./copy-command";

import type { SectionHeroProps } from "./types";

export async function SectionHero({ locale }: Readonly<SectionHeroProps>) {
  const t = await getTranslations({
    locale,
    namespace: "modules.staticPages.components.sectionHero",
  });

  return (
    <Flex
      align="center"
      as="section"
      justify="center"
      minH="100vh"
      position="relative"
      px={{ base: 6, md: 8 }}
      py={20}
    >
      <FloatingShapes />

      <VStack gap={{ base: 6, md: 8 }} maxW="4xl" textAlign="center" zIndex={1}>
        {/* Animated gradient heading */}
        <MotionReveal variant="fadeInUp">
          <Heading
            as="h1"
            bgClip="text"
            bgGradient="to-r"
            css={{
              "@keyframes gradientShift": {
                "0%, 100%": { backgroundPosition: "0% 50%" },
                "50%": { backgroundPosition: "100% 50%" },
              },
              "animation": "gradientShift 6s ease infinite",
              "backgroundSize": "200% 200%",
              "color": "transparent",
            }}
            fontSize={{ base: "3xl", lg: "6xl", md: "5xl", sm: "4xl" }}
            fontWeight="extrabold"
            gradientFrom="blue.400"
            gradientTo="pink.400"
            gradientVia="purple.500"
            letterSpacing="tight"
            lineHeight="1.1"
          >
            {t("title")}
          </Heading>
        </MotionReveal>

        {/* Subtitle */}
        <MotionReveal delay={0.15} variant="fadeInUp">
          <Text
            color={{ _dark: "gray.300", base: "gray.600" }}
            fontSize={{ base: "md", lg: "xl", md: "lg" }}
            lineHeight="tall"
            maxW="2xl"
            mx="auto"
          >
            {t("subtitle")}
          </Text>
        </MotionReveal>

        {/* Decorative gradient line */}
        <MotionReveal delay={0.3} variant="fadeIn">
          <Box
            bgGradient="to-r"
            borderRadius="full"
            gradientFrom="blue.400"
            gradientTo="pink.400"
            gradientVia="purple.500"
            h="3px"
            opacity={0.5}
            w={24}
          />
        </MotionReveal>

        {/* Copy command */}
        <MotionReveal delay={0.45} variant="fadeInUp">
          <CopyCommand />
        </MotionReveal>
      </VStack>

      <ScrollIndicator />
    </Flex>
  );
}
