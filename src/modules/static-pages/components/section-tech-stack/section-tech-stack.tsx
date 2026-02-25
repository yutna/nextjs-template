import "server-only";

import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

import { MarqueeRow } from "@/modules/static-pages/components/marquee-row";
import { MotionReveal } from "@/modules/static-pages/components/motion-reveal";

import { type SectionTechStackProps } from "./types";

const TECH_STACK = [
  { name: "Next.js", version: "16", color: "gray" },
  { name: "React", version: "19", color: "cyan" },
  { name: "Chakra UI", version: "3", color: "teal" },
  { name: "TypeScript", version: "5", color: "blue" },
  { name: "Zod", version: "4", color: "indigo" },
  { name: "motion", version: "12", color: "purple" },
  { name: "next-intl", version: "4", color: "orange" },
  { name: "SWR", version: "2", color: "gray" },
  { name: "Pino", version: "10", color: "green" },
  { name: "next-themes", version: "0.4", color: "pink" },
  { name: "nuqs", version: "2", color: "yellow" },
  { name: "dayjs", version: "1", color: "red" },
] as const;

export async function SectionTechStack({
  locale,
}: Readonly<SectionTechStackProps>) {
  const t = await getTranslations({
    locale,
    namespace: "modules.staticPages.welcome",
  });

  const badges = TECH_STACK.map((tech) => (
    <Box
      key={tech.name}
      px={5}
      py={2.5}
      borderRadius="full"
      border="1px solid"
      borderColor={{ base: `${tech.color}.200`, _dark: `${tech.color}.800` }}
      bg={{ base: `${tech.color}.50/60`, _dark: `${tech.color}.950/30` }}
      backdropFilter="blur(8px)"
      whiteSpace="nowrap"
      flexShrink={0}
      transition="all 0.2s ease"
      _hover={{
        borderColor: { base: `${tech.color}.300`, _dark: `${tech.color}.600` },
        bg: { base: `${tech.color}.100/80`, _dark: `${tech.color}.900/40` },
        transform: "scale(1.05)",
      }}
    >
      <Text
        fontSize="sm"
        fontWeight="semibold"
        color={{ base: `${tech.color}.700`, _dark: `${tech.color}.300` }}
      >
        {tech.name}
        <Text
          as="span"
          ml={1.5}
          fontWeight="normal"
          color={{ base: `${tech.color}.500`, _dark: `${tech.color}.400` }}
        >
          v{tech.version}
        </Text>
      </Text>
    </Box>
  ));

  return (
    <Box as="section" py={{ base: 16, md: 24 }} overflow="hidden">
      {/* Section heading */}
      <VStack
        gap={4}
        mb={{ base: 12, md: 16 }}
        textAlign="center"
        px={{ base: 6, md: 8 }}
      >
        <MotionReveal>
          <Heading
            as="h2"
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="bold"
            color={{ base: "gray.800", _dark: "gray.100" }}
          >
            {t("techHeading")}
          </Heading>
        </MotionReveal>

        <MotionReveal delay={0.1}>
          <Text
            color={{ base: "gray.500", _dark: "gray.400" }}
            fontSize={{ base: "md", md: "lg" }}
            maxW="2xl"
          >
            {t("techSubheading")}
          </Text>
        </MotionReveal>

        <MotionReveal variant="scaleIn" delay={0.2}>
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
      <MotionReveal variant="fadeIn" delay={0.3}>
        <MarqueeRow duration={40}>{badges}</MarqueeRow>
      </MotionReveal>
    </Box>
  );
}
