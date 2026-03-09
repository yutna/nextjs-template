"use client";

import { HStack, IconButton, Text } from "@chakra-ui/react";
import { LuCheck, LuCopy } from "react-icons/lu";

import { HERO_INSTALL_COMMAND } from "./constants";

import type { CopyCommandProps } from "./types";

export function CopyCommand({
  isCopied,
  isVibeOn,
  onCopy,
}: Readonly<CopyCommandProps>) {
  return (
    <HStack
      backdropFilter="blur(12px)"
      bg={isVibeOn ? "gray.950/85" : { _dark: "gray.950/85", base: "white/85" }}
      border="1px solid"
      borderColor={
        isVibeOn ? "gray.600/70" : { _dark: "gray.600/70", base: "gray.400/60" }
      }
      borderRadius="xl"
      gap={3}
      maxW="xl"
      mx="auto"
      px={4}
      py={3}
      w="full"
    >
      <Text
        as="span"
        color={{ _dark: "purple.400", base: "purple.500" }}
        flexShrink={0}
        fontFamily="mono"
        fontSize="xs"
        fontWeight="semibold"
      >
        $
      </Text>
      <Text
        color={isVibeOn ? "gray.100" : { _dark: "gray.100", base: "gray.700" }}
        flex={1}
        fontFamily="mono"
        fontSize="xs"
        truncate
      >
        {HERO_INSTALL_COMMAND}
      </Text>
      <IconButton
        _hover={{
          color: isVibeOn
            ? "gray.100"
            : { _dark: "gray.100", base: "gray.800" },
        }}
        aria-label={isCopied ? "Copied" : "Copy command"}
        color={
          isCopied
            ? "green.400"
            : isVibeOn
              ? "gray.400"
              : { _dark: "gray.400", base: "gray.500" }
        }
        flexShrink={0}
        onClick={onCopy}
        size="xs"
        transition="all 0.2s ease"
        variant="ghost"
      >
        {isCopied ? <LuCheck /> : <LuCopy />}
      </IconButton>
    </HStack>
  );
}
