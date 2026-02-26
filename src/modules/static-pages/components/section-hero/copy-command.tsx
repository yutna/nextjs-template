"use client";

import { HStack, IconButton, Text } from "@chakra-ui/react";
import { useState } from "react";
import { LuCheck, LuCopy } from "react-icons/lu";

import { HERO_INSTALL_COMMAND } from "./constants";

export function CopyCommand() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(HERO_INSTALL_COMMAND);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <HStack
      gap={3}
      px={4}
      py={3}
      borderRadius="xl"
      border="1px solid"
      borderColor={{ base: "gray.200", _dark: "gray.700/60" }}
      bg={{ base: "gray.50/80", _dark: "gray.900/60" }}
      backdropFilter="blur(8px)"
      maxW="xl"
      w="full"
      mx="auto"
    >
      <Text
        as="span"
        color={{ base: "purple.500", _dark: "purple.400" }}
        fontFamily="mono"
        fontSize="xs"
        fontWeight="semibold"
        flexShrink={0}
      >
        $
      </Text>
      <Text
        color={{ base: "gray.700", _dark: "gray.300" }}
        fontFamily="mono"
        fontSize="xs"
        flex={1}
        truncate
      >
        {HERO_INSTALL_COMMAND}
      </Text>
      <IconButton
        aria-label={copied ? "Copied" : "Copy command"}
        size="xs"
        variant="ghost"
        color={copied ? "green.400" : { base: "gray.500", _dark: "gray.400" }}
        _hover={{ color: { base: "gray.800", _dark: "gray.100" } }}
        transition="all 0.2s ease"
        onClick={handleCopy}
        flexShrink={0}
      >
        {copied ? <LuCheck /> : <LuCopy />}
      </IconButton>
    </HStack>
  );
}
