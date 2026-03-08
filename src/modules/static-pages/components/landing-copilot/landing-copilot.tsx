import "server-only";

import { Box, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

import { MotionReveal } from "@/modules/static-pages/components/motion-reveal";
import { MotionStagger } from "@/modules/static-pages/components/motion-stagger";

import { COPILOT_FEATURES } from "./constants";

import type { LandingCopilotProps } from "./types";

export async function LandingCopilot({
  locale,
}: Readonly<LandingCopilotProps>) {
  const t = await getTranslations({
    locale,
    namespace: "modules.staticPages.components.landingCopilot",
  });

  return (
    <Box
      as="section"
      bg={{ _dark: "gray.900", base: "gray.50" }}
      px={{ base: 6, md: 8 }}
      py={{ base: 16, md: 24 }}
    >
      <Box maxW="4xl" mx="auto">
        {/* Section header */}
        <VStack gap={0} textAlign="center">
          <MotionReveal variant="fadeInUp">
            <Text
              color={{ _dark: "gray.500", base: "gray.400" }}
              fontFamily="mono"
              fontSize="xs"
              letterSpacing="widest"
              mb={3}
              textTransform="uppercase"
            >
              GitHub Copilot
            </Text>
          </MotionReveal>

          <MotionReveal delay={0.05} variant="fadeInUp">
            <Text
              color={{ _dark: "white", base: "gray.900" }}
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
            >
              {t("heading")}
            </Text>
          </MotionReveal>

          <MotionReveal delay={0.1} variant="fadeInUp">
            <Box
              bg={{ _dark: "blue.400", base: "blue.600" }}
              borderRadius="full"
              h="2px"
              mt={3}
              mx="auto"
              w="12"
            />
          </MotionReveal>

          <MotionReveal delay={0.15} variant="fadeInUp">
            <Text
              color={{ _dark: "gray.400", base: "gray.600" }}
              fontSize={{ base: "sm", md: "md" }}
              mt={4}
              textAlign="center"
            >
              {t("subheading")}
            </Text>
          </MotionReveal>
        </VStack>

        {/* Features grid */}
        <Box mt={{ base: 10, md: 14 }}>
          <MotionStagger staggerDelay={0.08}>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              {COPILOT_FEATURES.map((feature) => {
                const FeatureIcon = feature.icon;
                return (
                  <MotionReveal key={feature.titleKey} variant="fadeInUp">
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
                      <HStack gap={3} mb={3}>
                        <Box color={{ _dark: "blue.400", base: "blue.600" }}>
                          <FeatureIcon height={16} width={16} />
                        </Box>
                        <Text
                          color={{ _dark: "white", base: "gray.900" }}
                          fontSize="sm"
                          fontWeight="semibold"
                        >
                          {t(feature.titleKey as Parameters<typeof t>[0])}
                        </Text>
                      </HStack>
                      <Text
                        color={{ _dark: "gray.400", base: "gray.600" }}
                        fontSize="sm"
                        lineHeight="tall"
                      >
                        {t(feature.descriptionKey as Parameters<typeof t>[0])}
                      </Text>
                    </Box>
                  </MotionReveal>
                );
              })}
            </SimpleGrid>
          </MotionStagger>
        </Box>
      </Box>
    </Box>
  );
}
