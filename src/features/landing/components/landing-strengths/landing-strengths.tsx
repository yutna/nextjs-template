import "server-only";

import { Box, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

import { MotionReveal } from "@/features/landing/components/motion-reveal";
import { MotionStagger } from "@/features/landing/components/motion-stagger";

import { STRENGTHS } from "./constants";

import type { LandingStrengthsProps } from "./types";

export async function LandingStrengths({
  locale,
}: Readonly<LandingStrengthsProps>) {
  const t = await getTranslations({
    locale,
    namespace: "features.landing.components.landingStrengths",
  });

  return (
    <Box
      as="section"
      bg={{ _dark: "gray.900", base: "gray.50" }}
      px={{ base: 6, md: 8 }}
      py={{ base: 16, md: 24 }}
    >
      <Box maxW="5xl" mx="auto">
        {/* Section header */}
        <VStack gap={3} mb={{ base: 10, md: 14 }} textAlign="center">
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

        {/* Strengths grid */}
        <MotionStagger staggerDelay={0.07}>
          <SimpleGrid columns={{ base: 1, lg: 3, md: 2 }} gap={4}>
            {STRENGTHS.map((strength) => {
              const StrengthIcon = strength.icon;
              return (
                <MotionReveal key={strength.titleKey} variant="fadeInUp">
                  <Box
                    _hover={{
                      borderColor: { _dark: "gray.700", base: "gray.300" },
                    }}
                    bg={{ _dark: "gray.950", base: "white" }}
                    border="1px solid"
                    borderColor={{ _dark: "gray.800", base: "gray.200" }}
                    borderRadius="lg"
                    h="full"
                    p={{ base: 5, md: 6 }}
                    transition="border-color 0.2s ease"
                  >
                    {/* Icon */}
                    <Box color={{ _dark: "blue.400", base: "blue.600" }} mb={3}>
                      <StrengthIcon height={20} width={20} />
                    </Box>

                    {/* Title */}
                    <Text
                      color={{ _dark: "white", base: "gray.900" }}
                      fontSize="sm"
                      fontWeight="semibold"
                      mb={2}
                    >
                      {t(strength.titleKey as Parameters<typeof t>[0])}
                    </Text>

                    {/* Description */}
                    <Text
                      color={{ _dark: "gray.400", base: "gray.600" }}
                      fontSize="sm"
                      lineHeight="tall"
                    >
                      {t(strength.descriptionKey as Parameters<typeof t>[0])}
                    </Text>
                  </Box>
                </MotionReveal>
              );
            })}
          </SimpleGrid>
        </MotionStagger>
      </Box>
    </Box>
  );
}
