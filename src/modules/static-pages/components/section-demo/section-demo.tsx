import "server-only";

import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

import { MotionReveal } from "@/modules/static-pages/components/motion-reveal";

import { DemoContent } from "./demo-content";

import type { SectionDemoProps } from "./types";

export async function SectionDemo({ locale }: Readonly<SectionDemoProps>) {
  const t = await getTranslations({
    locale,
    namespace: "modules.staticPages.components.sectionDemo",
  });

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

        <MotionReveal delay={0.1}>
          <Text
            color={{ _dark: "gray.400", base: "gray.500" }}
            fontSize={{ base: "md", md: "lg" }}
            maxW="2xl"
          >
            {t("subheading")}
          </Text>
        </MotionReveal>

        <MotionReveal delay={0.2} variant="scaleIn">
          <Box
            bgGradient="to-r"
            borderRadius="full"
            gradientFrom="purple.400"
            gradientTo="pink.500"
            h="3px"
            w={16}
          />
        </MotionReveal>
      </VStack>

      {/* Interactive demo */}
      <MotionReveal delay={0.2} variant="scaleIn">
        <DemoContent codeComment={t("demoCodeComment")} />
      </MotionReveal>
    </Box>
  );
}
