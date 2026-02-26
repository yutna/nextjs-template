"use client";

import { Box, HStack, Span, Text } from "@chakra-ui/react";
import { motion } from "motion/react";

import { GlassCard } from "@/modules/static-pages/components/glass-card";
import { ColorModeButton } from "@/shared/vendor/chakra-ui/color-mode";

import { CODE_LINES } from "./constants";

import type { DemoContentProps } from "./types";

export function DemoContent({ codeComment }: Readonly<DemoContentProps>) {
  return (
    <GlassCard p={0} overflow="hidden" maxW="2xl" mx="auto">
      {/* Editor title bar */}
      <HStack
        px={4}
        py={3}
        bg={{ base: "gray.100/80", _dark: "gray.800/80" }}
        borderBottom="1px solid"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        gap={3}
      >
        {/* Window dots */}
        <HStack gap={1.5}>
          <Box w={3} h={3} borderRadius="full" bg="red.400" />
          <Box w={3} h={3} borderRadius="full" bg="yellow.400" />
          <Box w={3} h={3} borderRadius="full" bg="green.400" />
        </HStack>

        <Text
          fontSize="xs"
          color={{ base: "gray.500", _dark: "gray.400" }}
          fontFamily="mono"
          flex={1}
          textAlign="center"
        >
          app.tsx
        </Text>

        {/* Theme toggle integrated */}
        <ColorModeButton size="xs" variant="ghost" />
      </HStack>

      {/* Code editor body */}
      <Box
        bg={{ base: "gray.900", _dark: "gray.950" }}
        px={4}
        py={4}
        fontFamily="mono"
        fontSize={{ base: "xs", md: "sm" }}
        lineHeight="1.8"
        overflowX="auto"
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Comment line */}
          <HStack gap={3} align="start">
            <Text
              color="gray.600"
              w="6"
              textAlign="right"
              userSelect="none"
              flexShrink={0}
            >
              1
            </Text>
            <Text color="gray.500" fontStyle="italic">
              {codeComment}
            </Text>
          </HStack>

          {/* Code lines with staggered reveal */}
          {CODE_LINES.map((line, lineIndex) => (
            <motion.div
              key={lineIndex}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.1 + lineIndex * 0.06,
                duration: 0.3,
              }}
              style={{ willChange: "transform, opacity" }}
            >
              <HStack gap={3} align="start" minH="1.8em">
                <Text
                  color="gray.600"
                  w="6"
                  textAlign="right"
                  userSelect="none"
                  flexShrink={0}
                >
                  {lineIndex + 2}
                </Text>
                <Box>
                  {line.tokens.length === 0 ? (
                    <Text>&nbsp;</Text>
                  ) : (
                    line.tokens.map((token, tokenIndex) => (
                      <Span key={tokenIndex} color={token.color}>
                        {token.text}
                      </Span>
                    ))
                  )}
                </Box>
              </HStack>
            </motion.div>
          ))}

          {/* Blinking cursor */}
          <HStack gap={3} align="start">
            <Text
              color="gray.600"
              w="6"
              textAlign="right"
              userSelect="none"
              flexShrink={0}
            >
              {CODE_LINES.length + 2}
            </Text>
            <Box
              w="2px"
              h="1.2em"
              bg="purple.400"
              css={{
                "animation": "blink 1.2s step-end infinite",
                "@keyframes blink": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0 },
                },
              }}
            />
          </HStack>
        </motion.div>
      </Box>
    </GlassCard>
  );
}
