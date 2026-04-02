"use client";

import {
  Box,
  Button,
  Dialog,
  Flex,
  HStack,
  Portal,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";

import {
  AI_ROLES,
  DONE_CRITERIA,
  PIPELINE_STEPS,
  TOUCHPOINTS,
} from "./constants";

import type { ReactNode } from "react";

export function WorkflowDetailDialog() {
  const t = useTranslations("modules.staticPages.components.landingCliUsage");

  return (
    <Dialog.Root
      data-testid="static-pages-workflow-detail-dialog-root"
      placement="center"
      scrollBehavior="inside"
      size="xl"
    >
      <Dialog.Trigger asChild>
        <Button
          _hover={{ textDecoration: "underline" }}
          color={{ _dark: "blue.400", base: "blue.600" }}
          data-testid="static-pages-workflow-detail-dialog-trigger"
          fontSize={{ base: "xs", md: "sm" }}
          fontWeight="medium"
          variant="plain"
        >
          {t("openButton")} →
        </Button>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            bg={{ _dark: "gray.900", base: "white" }}
            border="1px solid"
            borderColor={{ _dark: "gray.800", base: "gray.200" }}
          >
            <Dialog.CloseTrigger
              _hover={{ bg: { _dark: "gray.700", base: "gray.100" } }}
              borderRadius="full"
              cursor="pointer"
              insetEnd="3"
              p={2}
              position="absolute"
              top="3"
            >
              ✕
            </Dialog.CloseTrigger>

            <Dialog.Header pb={2} pt={6} px={{ base: 4, md: 6 }}>
              <VStack gap={1} textAlign="center" w="full">
                <Text fontSize="2xl" lineHeight="1">
                  🤖
                </Text>
                <Dialog.Title
                  color={{ _dark: "white", base: "gray.900" }}
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="bold"
                  textAlign="center"
                >
                  {t("dialogTitle")}
                </Dialog.Title>
                <Text
                  color={{ _dark: "gray.400", base: "gray.600" }}
                  fontSize={{ base: "xs", md: "sm" }}
                  maxW="md"
                  textAlign="center"
                >
                  {t("dialogSubtitle")}
                </Text>
              </VStack>
            </Dialog.Header>

            <Dialog.Body pb={6} px={{ base: 4, md: 6 }}>
              <Box>
                <SectionLabel>{t("touchpointSectionTitle")}</SectionLabel>

                <SimpleGrid columns={{ base: 1, md: 3 }} gap={3} mt={3}>
                  {TOUCHPOINTS.map((tp) => {
                    const isGreen = tp.accent === "green";

                    return (
                      <Box
                        bg={{ _dark: "gray.800", base: "gray.50" }}
                        borderLeft="3px solid"
                        borderLeftColor={
                          isGreen
                            ? { _dark: "green.400", base: "green.500" }
                            : { _dark: "blue.400", base: "blue.500" }
                        }
                        borderRadius="md"
                        key={tp.i18nKey}
                        p={4}
                      >
                        <Text fontSize="xl" lineHeight="1">
                          {tp.emoji}
                        </Text>
                        <Text
                          color={{ _dark: "white", base: "gray.900" }}
                          fontSize="sm"
                          fontWeight="bold"
                          mt={2}
                        >
                          {t(`${tp.i18nKey}Title`)}
                        </Text>
                        <Text
                          bg={
                            isGreen
                              ? { _dark: "green.950", base: "green.100" }
                              : { _dark: "blue.950", base: "blue.100" }
                          }
                          borderRadius="full"
                          color={
                            isGreen
                              ? { _dark: "green.300", base: "green.700" }
                              : { _dark: "blue.300", base: "blue.700" }
                          }
                          display="inline-block"
                          fontSize="2xs"
                          fontWeight="semibold"
                          mt={2}
                          px={2}
                          py={0.5}
                        >
                          {t(`${tp.i18nKey}Time`)}
                        </Text>
                        <Text
                          color={{ _dark: "gray.400", base: "gray.600" }}
                          fontSize="xs"
                          lineHeight="tall"
                          mt={2}
                        >
                          {t(`${tp.i18nKey}Desc`)}
                        </Text>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              </Box>

              <Box mt={8}>
                <SectionLabel>{t("rolesSectionTitle")}</SectionLabel>

                <SimpleGrid columns={{ base: 2, md: 3 }} gap={2} mt={3}>
                  {AI_ROLES.map((role) => (
                    <Box
                      bg={{ _dark: "gray.800", base: "gray.50" }}
                      borderRadius="md"
                      key={role.i18nKey}
                      p={3}
                    >
                      <HStack gap={2}>
                        <Text fontSize="lg" lineHeight="1">
                          {role.emoji}
                        </Text>
                        <Box>
                          <Text
                            color={{ _dark: "white", base: "gray.900" }}
                            fontSize="xs"
                            fontWeight="bold"
                            lineHeight="tight"
                          >
                            {t(`${role.i18nKey}Name`)}
                          </Text>
                          <Text
                            color={{ _dark: "gray.500", base: "gray.500" }}
                            fontFamily="mono"
                            fontSize="2xs"
                          >
                            {role.tool}
                          </Text>
                        </Box>
                      </HStack>
                      <Text
                        color={{ _dark: "gray.400", base: "gray.600" }}
                        fontSize="2xs"
                        lineHeight="tall"
                        mt={2}
                      >
                        {t(`${role.i18nKey}Desc`)}
                      </Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>

              <Box mt={8}>
                <SectionLabel>{t("pipelineSectionTitle")}</SectionLabel>

                <Flex flexWrap="wrap" gap={2} mt={3}>
                  {PIPELINE_STEPS.map((step, i) => (
                    <HStack gap={1} key={step.i18nKey}>
                      <Box
                        bg={{ _dark: "gray.800", base: "gray.100" }}
                        borderRadius="md"
                        px={3}
                        py={1.5}
                      >
                        <HStack gap={1.5}>
                          <Text fontSize="sm" lineHeight="1">
                            {step.emoji}
                          </Text>
                          <Text
                            color={{ _dark: "gray.200", base: "gray.700" }}
                            fontSize="xs"
                            fontWeight="medium"
                          >
                            {t(step.i18nKey)}
                          </Text>
                        </HStack>
                      </Box>
                      {i < PIPELINE_STEPS.length - 1 && (
                        <Text
                          color={{ _dark: "gray.600", base: "gray.400" }}
                          fontSize="xs"
                        >
                          →
                        </Text>
                      )}
                    </HStack>
                  ))}
                </Flex>
              </Box>

              <Box mt={8}>
                <SectionLabel>{t("doneSectionTitle")}</SectionLabel>

                <VStack align="start" gap={2} mt={3}>
                  {DONE_CRITERIA.map((key) => (
                    <HStack gap={2} key={key}>
                      <Text color="green.500" fontSize="xs" lineHeight="1">
                        ✓
                      </Text>
                      <Text
                        color={{ _dark: "gray.300", base: "gray.700" }}
                        fontSize="xs"
                        lineHeight="tall"
                      >
                        {t(key)}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function SectionLabel({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <HStack gap={3}>
      <Box
        bg={{ _dark: "blue.400", base: "blue.600" }}
        borderRadius="full"
        flexShrink={0}
        h="2px"
        w="4"
      />
      <Text
        color={{ _dark: "gray.400", base: "gray.500" }}
        fontSize="2xs"
        fontWeight="bold"
        letterSpacing="widest"
        textTransform="uppercase"
      >
        {children}
      </Text>
    </HStack>
  );
}
