import "server-only";

import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

import { MotionReveal } from "@/modules/static-pages/components/motion-reveal";
import { MotionStagger } from "@/modules/static-pages/components/motion-stagger";

import { WORKFLOW_STEPS } from "./constants";

import type { LandingAiWorkflowProps } from "./types";

export async function LandingAiWorkflow({
  locale,
}: Readonly<LandingAiWorkflowProps>) {
  const t = await getTranslations({
    locale,
    namespace: "modules.staticPages.components.landingAiWorkflow",
  });

  return (
    <Box
      as="section"
      bg={{ _dark: "gray.950", base: "white" }}
      px={{ base: 6, md: 8 }}
      py={{ base: 16, md: 24 }}
    >
      <Box maxW="3xl" mx="auto">
        {/* Section header */}
        <VStack gap={0} textAlign="center">
          <MotionReveal variant="fadeInUp">
            <Text
              color={{ _dark: "white", base: "gray.900" }}
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
            >
              {t("heading")}
            </Text>
          </MotionReveal>

          <MotionReveal delay={0.05} variant="fadeInUp">
            <Box
              bg={{ _dark: "blue.400", base: "blue.600" }}
              borderRadius="full"
              h="2px"
              mt={3}
              mx="auto"
              w="12"
            />
          </MotionReveal>

          <MotionReveal delay={0.1} variant="fadeInUp">
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

        {/* Steps list */}
        <Box mt={{ base: 10, md: 14 }}>
          <MotionStagger staggerDelay={0.1}>
            {WORKFLOW_STEPS.map((step, index) => (
              <MotionReveal key={step.key} variant="fadeInUp">
                <HStack
                  align="flex-start"
                  borderBottom={index < WORKFLOW_STEPS.length - 1 ? "1px solid" : undefined}
                  borderColor={{ _dark: "gray.800", base: "gray.100" }}
                  gap={{ base: 3, md: 5 }}
                  py={{ base: 4, md: 5 }}
                >
                  {/* Step number */}
                  <Text
                    color={{ _dark: "blue.400/40", base: "blue.600/30" }}
                    fontFamily="mono"
                    fontSize={{ base: "xl", md: "2xl" }}
                    fontWeight="bold"
                    lineHeight="1"
                    minW={{ base: "8", md: "12" }}
                    pt="0.5"
                  >
                    {step.stepNumber}
                  </Text>

                  {/* Step content */}
                  <VStack align="flex-start" gap={1}>
                    <Text
                      color={{ _dark: "white", base: "gray.900" }}
                      fontSize="sm"
                      fontWeight="semibold"
                    >
                      {t(`${step.key}Title`)}
                    </Text>
                    <Text
                      color={{ _dark: "gray.400", base: "gray.600" }}
                      fontSize="sm"
                      lineHeight="tall"
                    >
                      {t(`${step.key}Description`)}
                    </Text>
                  </VStack>
                </HStack>
              </MotionReveal>
            ))}
          </MotionStagger>
        </Box>
      </Box>
    </Box>
  );
}
