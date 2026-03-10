"use client";

import { Box, Card, HStack, Text, VStack } from "@chakra-ui/react";
import { useTranslations } from "next-intl";

import type { CardThemePresetProps } from "./types";

export function CardThemePreset({
  isActive,
  onClickSelect,
  preset,
}: Readonly<CardThemePresetProps>) {
  const t = useTranslations("modules.themeSettings.presets");

  function handleClick() {
    onClickSelect(preset);
  }

  return (
    <Card.Root
      _focusVisible={{
        outlineColor: "blue.focusRing",
        outlineOffset: "2px",
        outlineStyle: "solid",
        outlineWidth: "2px",
      }}
      _hover={{ borderColor: "colorPalette.solid", shadow: "sm" }}
      asChild
      borderColor={isActive ? "colorPalette.solid" : "border"}
      borderWidth={isActive ? "2px" : "1px"}
      colorPalette="blue"
      cursor="pointer"
      p={3}
      textAlign="start"
      transition="all 0.15s"
    >
      <button aria-pressed={isActive} onClick={handleClick} type="button">
        <Card.Body gap={2} p={0}>
          <HStack flexWrap="wrap" gap={1}>
            {preset.swatches.map((hex, index) => (
              <Box
                aria-hidden
                bg={hex}
                borderColor="border"
                borderRadius="full"
                borderWidth="1px"
                flexShrink={0}
                h="20px"
                key={`${index}-${hex}`}
                w="20px"
              />
            ))}
          </HStack>
          <VStack align="start" gap={0.5}>
            <Text fontSize="sm" fontWeight={isActive ? "bold" : "medium"}>
              {t(`${preset.id}.name`)}
            </Text>
            <Text color="fg.muted" fontSize="xs" lineClamp={2}>
              {t(`${preset.id}.description`)}
            </Text>
          </VStack>
        </Card.Body>
      </button>
    </Card.Root>
  );
}
