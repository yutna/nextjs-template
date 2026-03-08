import "server-only";

import { Box, Text, VStack } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

import { MotionReveal } from "@/modules/static-pages/components/motion-reveal";
import { MotionStagger } from "@/modules/static-pages/components/motion-stagger";

import { WORKFLOW_STEPS } from "./constants";
import { WorkflowDetailDialog } from "./workflow-detail-dialog";

import type { LandingCliUsageProps } from "./types";

export async function LandingCliUsage({
  locale,
}: Readonly<LandingCliUsageProps>) {
  const t = await getTranslations({
    locale,
    namespace: "modules.staticPages.components.landingCliUsage",
  });

  const isLastStep = (index: number) => index === WORKFLOW_STEPS.length - 1;

  return (
    <Box
      as="section"
      bg={{ _dark: "gray.950", base: "white" }}
      px={{ base: 6, md: 8 }}
      py={{ base: 16, md: 24 }}
    >
      <Box maxW="3xl" mx="auto">
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

        <VStack gap={{ base: 10, md: 14 }} mt={{ base: 10, md: 14 }}>
          <MotionStagger staggerDelay={0.15}>
            {WORKFLOW_STEPS.map((step, index) => (
              <MotionReveal key={step.key} variant="fadeInUp">
                <Box w="full">
                  <Text
                    color={{ _dark: "gray.400", base: "gray.500" }}
                    fontSize="xs"
                    fontWeight="semibold"
                    letterSpacing="wider"
                    mb={2}
                    textTransform="uppercase"
                  >
                    {step.step} — {t(`${step.key}Title`)}
                  </Text>

                  <Box
                    bg={{ _dark: "gray.900", base: "gray.950" }}
                    borderRadius="lg"
                    overflow="hidden"
                    px={{ base: 4, md: 5 }}
                    py={{ base: 3, md: 4 }}
                  >
                    <Text
                      color={{ _dark: "green.400", base: "green.400" }}
                      fontFamily="mono"
                      fontSize={{ base: "xs", md: "sm" }}
                      lineHeight="tall"
                      whiteSpace="pre-wrap"
                    >
                      {step.code}
                    </Text>
                  </Box>

                  <Text
                    color={{ _dark: "gray.500", base: "gray.500" }}
                    fontSize="xs"
                    lineHeight="tall"
                    mb={isLastStep(index) ? 0 : 4}
                    mt={2}
                  >
                    {t(`${step.key}Note`)}
                  </Text>
                </Box>
              </MotionReveal>
            ))}
          </MotionStagger>
        </VStack>

        <MotionReveal delay={0.3} variant="fadeInUp">
          <Box mt={{ base: 6, md: 8 }} textAlign="center">
            <WorkflowDetailDialog />
          </Box>
        </MotionReveal>
      </Box>
    </Box>
  );
}
