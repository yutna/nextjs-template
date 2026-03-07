"use client";

import { Box, HStack, Span, Text } from "@chakra-ui/react";
import { motion } from "motion/react";

import { GlassCard } from "@/modules/static-pages/components/glass-card";
import { ColorModeButton } from "@/shared/vendor/chakra-ui/color-mode";

import { CODE_LINES } from "./constants";

import type { DemoContentProps } from "./types";

export function DemoContent({ codeComment }: Readonly<DemoContentProps>) {
  return (
    <GlassCard maxW="2xl" mx="auto" overflow="hidden" p={0}>
      {/* Editor title bar */}
      <HStack
        bg={{ _dark: "gray.800/80", base: "gray.100/80" }}
        borderBottom="1px solid"
        borderColor={{ _dark: "gray.700", base: "gray.200" }}
        gap={3}
        px={4}
        py={3}
      >
        {/* Window dots */}
        <HStack gap={1.5}>
          <Box bg="red.400" borderRadius="full" h={3} w={3} />
          <Box bg="yellow.400" borderRadius="full" h={3} w={3} />
          <Box bg="green.400" borderRadius="full" h={3} w={3} />
        </HStack>

        <Text
          color={{ _dark: "gray.400", base: "gray.500" }}
          flex={1}
          fontFamily="mono"
          fontSize="xs"
          textAlign="center"
        >
          app.tsx
        </Text>

        {/* Theme toggle integrated */}
        <ColorModeButton size="xs" variant="ghost" />
      </HStack>

      {/* Code editor body */}
      <Box
        bg={{ _dark: "gray.950", base: "gray.50" }}
        fontFamily="mono"
        fontSize={{ base: "xs", md: "sm" }}
        lineHeight="1.8"
        overflowX="auto"
        px={4}
        py={4}
      >
        <motion.div
          initial={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1 }}
        >
          {/* Comment line */}
          <HStack align="start" gap={3}>
            <Text
              color={{ _dark: "gray.600", base: "gray.400" }}
              flexShrink={0}
              textAlign="right"
              userSelect="none"
              w="6"
            >
              1
            </Text>
            <Text
              color={{ _dark: "gray.500", base: "gray.400" }}
              fontStyle="italic"
            >
              {codeComment}
            </Text>
          </HStack>

          {/* Code lines with staggered reveal */}
          {CODE_LINES.map((line, lineIndex) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              key={lineIndex}
              style={{ willChange: "transform, opacity" }}
              transition={{
                delay: 0.1 + lineIndex * 0.06,
                duration: 0.3,
              }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <HStack align="start" gap={3} minH="1.8em">
                <Text
                  color={{ _dark: "gray.600", base: "gray.400" }}
                  flexShrink={0}
                  textAlign="right"
                  userSelect="none"
                  w="6"
                >
                  {lineIndex + 2}
                </Text>
                <Box whiteSpace="pre">
                  {line.tokens.length === 0 ? (
                    <Text>&nbsp;</Text>
                  ) : (
                    line.tokens.map((token, tokenIndex) => (
                      <Span
                        color={{ _dark: token.darkColor, base: token.color }}
                        key={tokenIndex}
                      >
                        {token.text}
                      </Span>
                    ))
                  )}
                </Box>
              </HStack>
            </motion.div>
          ))}

          {/* Blinking cursor */}
          <HStack align="start" gap={3}>
            <Text
              color={{ _dark: "gray.600", base: "gray.400" }}
              flexShrink={0}
              textAlign="right"
              userSelect="none"
              w="6"
            >
              {CODE_LINES.length + 2}
            </Text>
            <Box
              bg={{ _dark: "purple.400", base: "purple.500" }}
              css={{
                "@keyframes blink": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0 },
                },
                "animation": "blink 1.2s step-end infinite",
              }}
              h="1.2em"
              w="2px"
            />
          </HStack>
        </motion.div>
      </Box>
    </GlassCard>
  );
}
