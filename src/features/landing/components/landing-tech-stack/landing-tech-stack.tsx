import "server-only";

import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

import { MarqueeRow } from "@/features/landing/components/marquee-row";
import { MotionReveal } from "@/features/landing/components/motion-reveal";

import { TECH_STACK } from "./constants";

import type { LandingTechStackProps } from "./types";

export async function LandingTechStack({
  locale,
}: Readonly<LandingTechStackProps>) {
  const t = await getTranslations({
    locale,
    namespace: "features.landing.components.landingTechStack",
  });

  function renderBadges(
    items: ReadonlyArray<{ name: string; version: string }>,
  ) {
    return items.map((tech) => (
      <Box
        border="1px solid"
        borderColor={{ _dark: "gray.700", base: "gray.200" }}
        borderRadius="full"
        flexShrink={0}
        key={tech.name}
        px={4}
        py={2}
        whiteSpace="nowrap"
      >
        <Text
          color={{ _dark: "gray.300", base: "gray.600" }}
          fontFamily="mono"
          fontSize="xs"
        >
          {tech.name}
          <Text
            as="span"
            color={{ _dark: "gray.500", base: "gray.400" }}
            ml={1.5}
          >
            v{tech.version}
          </Text>
        </Text>
      </Box>
    ));
  }

  const rowItems = renderBadges(TECH_STACK);

  return (
    <Box
      as="section"
      bg={{ _dark: "gray.950", base: "white" }}
      overflow="hidden"
      py={{ base: 16, md: 20 }}
    >
      <VStack gap={3} px={{ base: 6, md: 8 }} textAlign="center" w="full">
        <MotionReveal>
          <Heading
            as="h2"
            color={{ _dark: "white", base: "gray.900" }}
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="bold"
          >
            {t("heading")}
          </Heading>
        </MotionReveal>

        <MotionReveal delay={0.1}>
          <Box
            bg={{ _dark: "blue.400", base: "blue.600" }}
            borderRadius="full"
            h="2px"
            mt={3}
            mx="auto"
            w="12"
          />
        </MotionReveal>

        <MotionReveal delay={0.2}>
          <Text
            color={{ _dark: "gray.400", base: "gray.600" }}
            fontSize={{ base: "sm", md: "md" }}
          >
            {t("subheading")}
          </Text>
        </MotionReveal>
      </VStack>

      <MotionReveal delay={0.3} variant="fadeIn">
        <Box mt={{ base: 10, md: 14 }} w="full">
          <MarqueeRow duration={30}>{rowItems}</MarqueeRow>
        </Box>
      </MotionReveal>
    </Box>
  );
}
