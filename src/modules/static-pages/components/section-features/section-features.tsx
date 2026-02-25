import "server-only";

import { Box, Grid, Heading, Icon, Text, VStack } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";
import {
  LuGlobe,
  LuLock,
  LuMoon,
  LuPalette,
  LuRoute,
  LuShield,
} from "react-icons/lu";

import { GlassCard } from "@/modules/static-pages/components/glass-card";
import { MotionReveal } from "@/modules/static-pages/components/motion-reveal";
import { MotionStagger } from "@/modules/static-pages/components/motion-stagger";

import { type SectionFeaturesProps } from "./types";

const FEATURE_ICONS = [
  LuRoute,
  LuPalette,
  LuShield,
  LuGlobe,
  LuMoon,
  LuLock,
] as const;

const FEATURE_COLORS = [
  { from: "blue.400", to: "cyan.400" },
  { from: "purple.400", to: "pink.400" },
  { from: "green.400", to: "teal.400" },
  { from: "orange.400", to: "yellow.400" },
  { from: "indigo.400", to: "purple.400" },
  { from: "red.400", to: "orange.400" },
] as const;

export async function SectionFeatures({
  locale,
}: Readonly<SectionFeaturesProps>) {
  const t = await getTranslations({
    locale,
    namespace: "modules.staticPages.welcome",
  });

  const features = Array.from({ length: 6 }, (_, i) => ({
    icon: FEATURE_ICONS[i],
    title: t(`feature${i + 1}Title` as `feature${1 | 2 | 3 | 4 | 5 | 6}Title`),
    description: t(
      `feature${i + 1}Desc` as `feature${1 | 2 | 3 | 4 | 5 | 6}Desc`,
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
            {t("featuresHeading")}
          </Heading>
        </MotionReveal>

        <MotionReveal delay={0.1}>
          <Text
            color={{ base: "gray.500", _dark: "gray.400" }}
            fontSize={{ base: "md", md: "lg" }}
            maxW="2xl"
          >
            {t("featuresSubheading")}
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
                _hover={{
                  boxShadow: `0 0 24px rgba(139, 92, 246, 0.15)`,
                  borderColor: { base: "purple.200", _dark: "purple.700/50" },
                  transform: "translateY(-4px)",
                }}
              >
                <VStack align="start" gap={4}>
                  {/* Icon with gradient background */}
                  <Box
                    p={3}
                    borderRadius="xl"
                    bgGradient="to-br"
                    gradientFrom={feature.color.from}
                    gradientTo={feature.color.to}
                    color="white"
                    boxShadow={`0 4px 14px rgba(0, 0, 0, 0.1)`}
                  >
                    <Icon asChild boxSize={5}>
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
