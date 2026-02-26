import "server-only";

import { Box, Button, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";
import { LuArrowRight } from "react-icons/lu";

import { FloatingShapes } from "@/modules/static-pages/components/floating-shapes";
import { MotionReveal } from "@/modules/static-pages/components/motion-reveal";
import { ScrollIndicator } from "@/modules/static-pages/components/scroll-indicator";

import type { SectionHeroProps } from "./types";

export async function SectionHero({ locale }: Readonly<SectionHeroProps>) {
  const t = await getTranslations({
    locale,
    namespace: "modules.staticPages.welcome",
  });

  return (
    <Flex
      as="section"
      align="center"
      justify="center"
      minH="100vh"
      position="relative"
      px={{ base: 6, md: 8 }}
      py={20}
    >
      <FloatingShapes />

      <VStack gap={{ base: 6, md: 8 }} maxW="4xl" textAlign="center" zIndex={1}>
        {/* Animated gradient heading */}
        <MotionReveal variant="fadeInUp">
          <Heading
            as="h1"
            bgClip="text"
            bgGradient="to-r"
            css={{
              "color": "transparent",
              "backgroundSize": "200% 200%",
              "animation": "gradientShift 6s ease infinite",
              "@keyframes gradientShift": {
                "0%, 100%": { backgroundPosition: "0% 50%" },
                "50%": { backgroundPosition: "100% 50%" },
              },
            }}
            fontSize={{ base: "3xl", sm: "4xl", md: "5xl", lg: "6xl" }}
            fontWeight="extrabold"
            gradientFrom="blue.400"
            gradientVia="purple.500"
            gradientTo="pink.400"
            letterSpacing="tight"
            lineHeight="1.1"
          >
            {t("heroTitle")}
          </Heading>
        </MotionReveal>

        {/* Subtitle */}
        <MotionReveal variant="fadeInUp" delay={0.15}>
          <Text
            color={{ base: "gray.600", _dark: "gray.300" }}
            fontSize={{ base: "md", md: "lg", lg: "xl" }}
            lineHeight="tall"
            maxW="2xl"
            mx="auto"
          >
            {t("heroSubtitle")}
          </Text>
        </MotionReveal>

        {/* CTA buttons */}
        <MotionReveal variant="fadeInUp" delay={0.3}>
          <Flex
            direction={{ base: "column", sm: "row" }}
            gap={4}
            justify="center"
            w="full"
          >
            <Button
              asChild
              size="lg"
              bgGradient="to-r"
              gradientFrom="blue.500"
              gradientTo="purple.500"
              color="white"
              px={8}
              fontWeight="semibold"
              boxShadow="0 0 20px rgba(139, 92, 246, 0.3)"
              _hover={{
                boxShadow: "0 0 30px rgba(139, 92, 246, 0.5)",
                transform: "translateY(-1px)",
              }}
              transition="all 0.2s ease"
            >
              <a
                href="https://github.com/yutna/nextjs-template"
                rel="noopener noreferrer"
                target="_blank"
              >
                {t("heroCta")}
                <LuArrowRight />
              </a>
            </Button>
          </Flex>
        </MotionReveal>

        {/* Decorative gradient line */}
        <MotionReveal variant="fadeIn" delay={0.45}>
          <Box
            bgGradient="to-r"
            borderRadius="full"
            gradientFrom="blue.400"
            gradientVia="purple.500"
            gradientTo="pink.400"
            h="3px"
            mt={4}
            opacity={0.5}
            w={24}
          />
        </MotionReveal>
      </VStack>

      <ScrollIndicator />
    </Flex>
  );
}
