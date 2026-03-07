"use client";

import { HStack, IconButton, Text } from "@chakra-ui/react";
import { LuCheck, LuCopy } from "react-icons/lu";
import { useImmer } from "use-immer";

import { HERO_INSTALL_COMMAND } from "./constants";

export function CopyCommand() {
  const [state, updateState] = useImmer({ copied: false });

  async function handleCopy() {
    await navigator.clipboard.writeText(HERO_INSTALL_COMMAND);
    updateState((draft) => {
      draft.copied = true;
    });
    setTimeout(() => {
      updateState((draft) => {
        draft.copied = false;
      });
    }, 2000);
  }

  return (
    <HStack
      backdropFilter="blur(8px)"
      bg={{ _dark: "gray.900/60", base: "gray.50/80" }}
      border="1px solid"
      borderColor={{ _dark: "gray.700/60", base: "gray.200" }}
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
        color={{ _dark: "gray.300", base: "gray.700" }}
        flex={1}
        fontFamily="mono"
        fontSize="xs"
        truncate
      >
        {HERO_INSTALL_COMMAND}
      </Text>
      <IconButton
        _hover={{ color: { _dark: "gray.100", base: "gray.800" } }}
        aria-label={state.copied ? "Copied" : "Copy command"}
        color={
          state.copied
            ? "green.400"
            : { _dark: "gray.400", base: "gray.500" }
        }
        flexShrink={0}
        onClick={handleCopy}
        size="xs"
        transition="all 0.2s ease"
        variant="ghost"
      >
        {state.copied ? <LuCheck /> : <LuCopy />}
      </IconButton>
    </HStack>
  );
}
