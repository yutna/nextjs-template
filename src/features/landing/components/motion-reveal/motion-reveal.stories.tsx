import { Box, Heading } from "@chakra-ui/react";

import { MotionReveal } from "./motion-reveal";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: MotionReveal,
  parameters: {
    layout: "centered",
  },
  title: "features/landing/components/motion-reveal",
} satisfies Meta<typeof MotionReveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FadeInUp: Story = {
  args: {
    delay: 0,
    variant: "fadeInUp",
  },
  render: (args) => (
    <MotionReveal {...args}>
      <Box
        bg={{ _dark: "gray.800", base: "gray.100" }}
        borderRadius="xl"
        p={8}
        w="300px"
      >
        <Heading size="md">Fade In Up</Heading>
      </Box>
    </MotionReveal>
  ),
};

export const FadeIn: Story = {
  args: {
    delay: 0,
    variant: "fadeIn",
  },
  render: (args) => (
    <MotionReveal {...args}>
      <Box
        bg={{ _dark: "gray.800", base: "gray.100" }}
        borderRadius="xl"
        p={8}
        w="300px"
      >
        <Heading size="md">Fade In</Heading>
      </Box>
    </MotionReveal>
  ),
};

export const ScaleIn: Story = {
  args: {
    delay: 0,
    variant: "scaleIn",
  },
  render: (args) => (
    <MotionReveal {...args}>
      <Box
        bg={{ _dark: "gray.800", base: "gray.100" }}
        borderRadius="xl"
        p={8}
        w="300px"
      >
        <Heading size="md">Scale In</Heading>
      </Box>
    </MotionReveal>
  ),
};
