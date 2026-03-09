"use client";

import { Box, Card, HStack, Text, VStack } from "@chakra-ui/react";

import type { CardThemePresetProps } from "./types";

export function CardThemePreset({
  isActive,
  onClickSelect,
  preset,
}: Readonly<CardThemePresetProps>) {
  function handleClick() {
    onClickSelect(preset);
  }

  return (
    <Card.Root
      _hover={{ borderColor: "colorPalette.solid", shadow: "sm" }}
      borderColor={isActive ? "colorPalette.solid" : "border"}
      borderWidth={isActive ? "2px" : "1px"}
      cursor="pointer"
      onClick={handleClick}
      p={3}
      transition="all 0.15s"
    >
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
            {preset.name}
          </Text>
          <Text color="fg.muted" fontSize="xs" lineClamp={2}>
            {preset.description}
          </Text>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
