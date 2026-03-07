import "server-only";

import { Box, Grid, Heading, Icon, Text, VStack } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

import { GlassCard } from "@/modules/static-pages/components/glass-card";
import { MotionReveal } from "@/modules/static-pages/components/motion-reveal";
import { MotionStagger } from "@/modules/static-pages/components/motion-stagger";

import { FEATURE_COLORS, FEATURE_ICONS } from "./constants";

import type { SectionFeaturesProps } from "./types";

export async function SectionFeatures({
  locale,
}: Readonly<SectionFeaturesProps>) {
  const t = await getTranslations({
    locale,
    namespace: "modules.staticPages.components.sectionFeatures",
  });

  const features = Array.from({ length: 6 }, (_, i) => ({
    color: FEATURE_COLORS[i],
    description: t(
      `feature${i + 1}Description` as `feature${1 | 2 | 3 | 4 | 5 | 6}Description`,
    ),
    icon: FEATURE_ICONS[i],
    title: t(`feature${i + 1}Title` as `feature${1 | 2 | 3 | 4 | 5 | 6}Title`),
  }));

  return (
    <Box
      as="section"
      maxW="6xl"
      mx="auto"
      px={{ base: 6, md: 8 }}
      py={{ base: 16, md: 24 }}
    >
      {/* Section heading */}
      <VStack gap={4} mb={{ base: 12, md: 16 }} textAlign="center">
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

        {/* Gradient accent underline */}
        <MotionReveal delay={0.2} variant="scaleIn">
          <Box
            bgGradient="to-r"
            borderRadius="full"
            gradientFrom="blue.400"
            gradientTo="purple.500"
            h="3px"
            w={16}
          />
        </MotionReveal>
      </VStack>

      {/* Features grid */}
      <MotionStagger staggerDelay={0.08}>
        <Grid
          gap={{ base: 6, md: 8 }}
          templateColumns={{
            base: "1fr",
            lg: "repeat(3, 1fr)",
            md: "repeat(2, 1fr)",
          }}
        >
          {features.map((feature) => (
            <MotionReveal key={feature.title} variant="fadeInUp">
              <GlassCard
                _hover={{
                  borderColor: { _dark: "purple.700/50", base: "purple.200" },
                  boxShadow: `0 0 24px rgba(139, 92, 246, 0.15)`,
                  transform: "translateY(-4px)",
                }}
                bg={{ _dark: "gray.800/70", base: "white/90" }}
                borderColor={{ _dark: "gray.700/60", base: "gray.200/80" }}
                h="full"
              >
                <VStack align="start" gap={4}>
                  {/* Icon with color-adaptive background */}
                  <Box
                    bg="colorPalette.subtle"
                    borderRadius="xl"
                    colorPalette={feature.color}
                    p={3}
                  >
                    <Icon asChild boxSize={5} color="colorPalette.fg">
                      <feature.icon />
                    </Icon>
                  </Box>

                  {/* Title */}
                  <Heading
                    as="h3"
                    color={{ _dark: "gray.100", base: "gray.800" }}
                    fontSize="lg"
                    fontWeight="semibold"
                  >
                    {feature.title}
                  </Heading>

                  {/* Description */}
                  <Text
                    color={{ _dark: "gray.400", base: "gray.600" }}
                    fontSize="sm"
                    lineHeight="tall"
                  >
                    {feature.description}
                  </Text>
                </VStack>
              </GlassCard>
            </MotionReveal>
          ))}
        </Grid>
      </MotionStagger>
    </Box>
  );
}
