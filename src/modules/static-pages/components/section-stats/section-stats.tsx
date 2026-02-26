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
    namespace: "modules.staticPages.welcome",
  });

  const stats = Array.from({ length: 4 }, (_, i) => ({
    label: t(`stat${i + 1}Label` as `stat${1 | 2 | 3 | 4}Label`),
    value: Number(t(`stat${i + 1}Value` as `stat${1 | 2 | 3 | 4}Value`)),
    suffix: t(`stat${i + 1}Suffix` as `stat${1 | 2 | 3 | 4}Suffix`),
    gradient: STAT_GRADIENT_COLORS[i],
  }));

  return (
    <Box
      as="section"
      px={{ base: 6, md: 8 }}
      py={{ base: 16, md: 24 }}
      maxW="5xl"
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
            {t("statsHeading")}
          </Heading>
        </MotionReveal>

        <MotionReveal variant="scaleIn" delay={0.1}>
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
          templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
          gap={{ base: 4, md: 6 }}
        >
          {stats.map((stat) => (
            <MotionReveal key={stat.label} variant="scaleIn">
              <GlassCard
                textAlign="center"
                position="relative"
                overflow="hidden"
                p={{ base: 5, md: 8 }}
              >
                {/* Top gradient accent */}
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  h="3px"
                  bgGradient="to-r"
                  gradientFrom={stat.gradient.from}
                  gradientTo={stat.gradient.to}
                />

                <VStack gap={2}>
                  {/* Animated number */}
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                    prefix={stat.value < 10 ? "<" : ""}
                    fontSize={{ base: "3xl", md: "4xl" }}
                    fontWeight="extrabold"
                    bgClip="text"
                    bgGradient="to-r"
                    css={{ color: "transparent" }}
                    gradientFrom={stat.gradient.from}
                    gradientTo={stat.gradient.to}
                    lineHeight={1.2}
                  />

                  {/* Label */}
                  <Text
                    fontSize={{ base: "xs", md: "sm" }}
                    fontWeight="medium"
                    color={{ base: "gray.500", _dark: "gray.400" }}
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
