import { Box, Text, VStack } from "@chakra-ui/react";

import { MotionReveal } from "@/features/landing/components/motion-reveal";

import { MotionStagger } from "./motion-stagger";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  args: {
    // children is always provided via story render functions
    children: null,
  },
  component: MotionStagger,
  parameters: {
    layout: "centered",
  },
  title: "features/landing/components/motion-stagger",
} satisfies Meta<typeof MotionStagger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <MotionStagger staggerDelay={0.1}>
      {["First item", "Second item", "Third item", "Fourth item"].map(
        (label) => (
          <MotionReveal key={label} variant="fadeInUp">
            <Box
              bg={{ _dark: "gray.800", base: "gray.100" }}
              borderRadius="md"
              p={4}
              w="300px"
            >
              <Text>{label}</Text>
            </Box>
          </MotionReveal>
        ),
      )}
    </MotionStagger>
  ),
};

export const SlowStagger: Story = {
  render: () => (
    <MotionStagger staggerDelay={0.3}>
      <VStack gap={2}>
        {["First item", "Second item", "Third item"].map((label) => (
          <MotionReveal key={label} variant="fadeIn">
            <Box
              bg={{ _dark: "gray.800", base: "gray.100" }}
              borderRadius="md"
              p={4}
              w="300px"
            >
              <Text>{label}</Text>
            </Box>
          </MotionReveal>
        ))}
      </VStack>
    </MotionStagger>
  ),
};
