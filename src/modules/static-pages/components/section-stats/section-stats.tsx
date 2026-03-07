import "server-only";

import { Box, Grid, Heading, Text, VStack } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

import { AnimatedCounter } from "@/modules/static-pages/components/animated-counter";
import { GlassCard } from "@/modules/static-pages/components/glass-card";
import { MotionReveal } from "@/modules/static-pages/components/motion-reveal";
import { MotionStagger } from "@/modules/static-pages/components/motion-stagger";

import { STAT_GRADIENT_COLORS } from "./constants";

import type { SectionStatsProps } from "./types";

export async function SectionStats({ locale }: Readonly<SectionStatsProps>) {
  const t = await getTranslations({
    locale,
    namespace: "modules.staticPages.components.sectionStats",
  });

  const stats = Array.from({ length: 4 }, (_, i) => ({
    gradient: STAT_GRADIENT_COLORS[i],
    label: t(`stat${i + 1}Label` as `stat${1 | 2 | 3 | 4}Label`),
    suffix: t(`stat${i + 1}Suffix` as `stat${1 | 2 | 3 | 4}Suffix`),
    value: Number(t(`stat${i + 1}Value` as `stat${1 | 2 | 3 | 4}Value`)),
  }));

  return (
    <Box
      as="section"
      maxW="5xl"
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

        <MotionReveal delay={0.1} variant="scaleIn">
          <Box
            bgGradient="to-r"
            borderRadius="full"
            gradientFrom="green.400"
            gradientTo="teal.500"
            h="3px"
            w={16}
          />
        </MotionReveal>
      </VStack>

      {/* Stats grid */}
      <MotionStagger staggerDelay={0.1}>
        <Grid
          gap={{ base: 4, md: 6 }}
          templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
        >
          {stats.map((stat) => (
            <MotionReveal key={stat.label} variant="scaleIn">
              <GlassCard
                overflow="hidden"
                p={{ base: 5, md: 8 }}
                position="relative"
                textAlign="center"
              >
                {/* Top gradient accent */}
                <Box
                  bgGradient="to-r"
                  gradientFrom={stat.gradient.from}
                  gradientTo={stat.gradient.to}
                  h="3px"
                  left={0}
                  position="absolute"
                  right={0}
                  top={0}
                />

                <VStack gap={2}>
                  {/* Animated number */}
                  <AnimatedCounter
                    bgClip="text"
                    bgGradient="to-r"
                    css={{ color: "transparent" }}
                    fontSize={{ base: "3xl", md: "4xl" }}
                    fontWeight="extrabold"
                    gradientFrom={stat.gradient.from}
                    gradientTo={stat.gradient.to}
                    lineHeight={1.2}
                    prefix={stat.value < 10 ? "<" : ""}
                    suffix={stat.suffix}
                    target={stat.value}
                  />

                  {/* Label */}
                  <Text
                    color={{ _dark: "gray.400", base: "gray.500" }}
                    fontSize={{ base: "xs", md: "sm" }}
                    fontWeight="medium"
                  >
                    {stat.label}
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
