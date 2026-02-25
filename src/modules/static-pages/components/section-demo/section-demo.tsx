import "server-only";

import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

import { MotionReveal } from "@/modules/static-pages/components/motion-reveal";

import { DemoContent } from "./demo-content";
import { type SectionDemoProps } from "./types";

export async function SectionDemo({ locale }: Readonly<SectionDemoProps>) {
  const t = await getTranslations({
    locale,
    namespace: "modules.staticPages.welcome",
  });

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
            {t("demoHeading")}
          </Heading>
        </MotionReveal>

        <MotionReveal delay={0.1}>
          <Text
            color={{ base: "gray.500", _dark: "gray.400" }}
            fontSize={{ base: "md", md: "lg" }}
            maxW="2xl"
          >
            {t("demoSubheading")}
          </Text>
        </MotionReveal>

        <MotionReveal variant="scaleIn" delay={0.2}>
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
      <MotionReveal variant="scaleIn" delay={0.2}>
        <DemoContent codeComment={t("demoCodeComment")} />
      </MotionReveal>
    </Box>
  );
}
