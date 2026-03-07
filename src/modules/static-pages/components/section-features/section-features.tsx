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
    icon: FEATURE_ICONS[i],
    title: t(`feature${i + 1}Title` as `feature${1 | 2 | 3 | 4 | 5 | 6}Title`),
    description: t(
      `feature${i + 1}Description` as `feature${1 | 2 | 3 | 4 | 5 | 6}Description`,
    ),
    color: FEATURE_COLORS[i],
  }));

  return (
    <Box
      as="section"
      px={{ base: 6, md: 8 }}
      py={{ base: 16, md: 24 }}
      maxW="6xl"
      mx="auto"
    >
      {/* Section heading */}
      <VStack gap={4} mb={{ base: 12, md: 16 }} textAlign="center">
        <MotionReveal>
          <Heading
            as="h2"
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="bold"
            color={{ base: "gray.800", _dark: "gray.100" }}
          >
            {t("heading")}
          </Heading>
        </MotionReveal>

        <MotionReveal delay={0.1}>
          <Text
            color={{ base: "gray.500", _dark: "gray.400" }}
            fontSize={{ base: "md", md: "lg" }}
            maxW="2xl"
          >
            {t("subheading")}
          </Text>
        </MotionReveal>

        {/* Gradient accent underline */}
        <MotionReveal variant="scaleIn" delay={0.2}>
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
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
          gap={{ base: 6, md: 8 }}
        >
          {features.map((feature) => (
            <MotionReveal key={feature.title} variant="fadeInUp">
              <GlassCard
                h="full"
                bg={{ base: "white/90", _dark: "gray.800/70" }}
                borderColor={{ base: "gray.200/80", _dark: "gray.700/60" }}
                _hover={{
                  boxShadow: `0 0 24px rgba(139, 92, 246, 0.15)`,
                  borderColor: { base: "purple.200", _dark: "purple.700/50" },
                  transform: "translateY(-4px)",
                }}
              >
                <VStack align="start" gap={4}>
                  {/* Icon with color-adaptive background */}
                  <Box
                    p={3}
                    borderRadius="xl"
                    colorPalette={feature.color}
                    bg="colorPalette.subtle"
                  >
                    <Icon asChild boxSize={5} color="colorPalette.fg">
                      <feature.icon />
                    </Icon>
                  </Box>

                  {/* Title */}
                  <Heading
                    as="h3"
                    fontSize="lg"
                    fontWeight="semibold"
                    color={{ base: "gray.800", _dark: "gray.100" }}
                  >
                    {feature.title}
                  </Heading>

                  {/* Description */}
                  <Text
                    fontSize="sm"
                    color={{ base: "gray.600", _dark: "gray.400" }}
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
