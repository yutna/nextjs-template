import "server-only";

import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

import { MarqueeRow } from "@/modules/static-pages/components/marquee-row";
import { MotionReveal } from "@/modules/static-pages/components/motion-reveal";

import { TECH_STACK } from "./constants";

import type { SectionTechStackProps } from "./types";

export async function SectionTechStack({
  locale,
}: Readonly<SectionTechStackProps>) {
  const t = await getTranslations({
    locale,
    namespace: "modules.staticPages.components.sectionTechStack",
  });

  const badges = TECH_STACK.map((tech) => (
    <Box
      _hover={{
        bg: { _dark: `${tech.color}.900/40`, base: `${tech.color}.100/80` },
        borderColor: { _dark: `${tech.color}.600`, base: `${tech.color}.300` },
        transform: "scale(1.05)",
      }}
      backdropFilter="blur(8px)"
      bg={{ _dark: `${tech.color}.950/30`, base: `${tech.color}.50/60` }}
      border="1px solid"
      borderColor={{ _dark: `${tech.color}.800`, base: `${tech.color}.200` }}
      borderRadius="full"
      flexShrink={0}
      key={tech.name}
      px={5}
      py={2.5}
      transition="all 0.2s ease"
      whiteSpace="nowrap"
    >
      <Text
        color={{ _dark: `${tech.color}.300`, base: `${tech.color}.700` }}
        fontSize="sm"
        fontWeight="semibold"
      >
        {tech.name}
        <Text
          as="span"
          color={{ _dark: `${tech.color}.400`, base: `${tech.color}.500` }}
          fontWeight="normal"
          ml={1.5}
        >
          v{tech.version}
        </Text>
      </Text>
    </Box>
  ));

  return (
    <Box as="section" overflow="hidden" py={{ base: 16, md: 24 }}>
      {/* Section heading */}
      <VStack
        gap={4}
        mb={{ base: 12, md: 16 }}
        px={{ base: 6, md: 8 }}
        textAlign="center"
      >
        <MotionReveal>
          <Heading
            as="h2"
            color={{ _dark: "gray.100", base: "gray.800" }}
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="bold"
          >
            {t("heading")}
          </Heading>
        </MotionReveal>

        <MotionReveal delay={0.1}>
          <Text
            color={{ _dark: "gray.400", base: "gray.500" }}
            fontSize={{ base: "md", md: "lg" }}
            maxW="2xl"
          >
            {t("subheading")}
          </Text>
        </MotionReveal>

        <MotionReveal delay={0.2} variant="scaleIn">
          <Box
            bgGradient="to-r"
            borderRadius="full"
            gradientFrom="cyan.400"
            gradientTo="blue.500"
            h="3px"
            w={16}
          />
        </MotionReveal>
      </VStack>

      {/* Marquee badges */}
      <MotionReveal delay={0.3} variant="fadeIn">
        <MarqueeRow duration={40}>{badges}</MarqueeRow>
      </MotionReveal>
    </Box>
  );
}
