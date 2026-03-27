import { Box, Text } from "@chakra-ui/react";

import { MarqueeRow } from "./marquee-row.client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: MarqueeRow,
  parameters: {
    layout: "fullscreen",
  },
  title: "features/landing/components/marquee-row",
} satisfies Meta<typeof MarqueeRow>;

export default meta;
type Story = StoryObj<typeof meta>;

const SampleItems = () => (
  <>
    {["React", "Next.js", "TypeScript", "Chakra UI", "Vitest", "Storybook"].map(
      (label) => (
        <Box
          bg={{ _dark: "gray.800", base: "gray.100" }}
          borderRadius="full"
          key={label}
          px={4}
          py={2}
        >
          <Text fontSize="sm" fontWeight="medium">
            {label}
          </Text>
        </Box>
      ),
    )}
  </>
);

export const Forward: Story = {
  args: {
    duration: 20,
    reverse: false,
  },
  render: (args) => (
    <Box py={8}>
      <MarqueeRow {...args}>
        <SampleItems />
      </MarqueeRow>
    </Box>
  ),
};

export const Reverse: Story = {
  args: {
    duration: 20,
    reverse: true,
  },
  render: (args) => (
    <Box py={8}>
      <MarqueeRow {...args}>
        <SampleItems />
      </MarqueeRow>
    </Box>
  ),
};
