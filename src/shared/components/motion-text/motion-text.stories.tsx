import { Box, Heading, VStack } from "@chakra-ui/react";

import { MotionText } from "./motion-text";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: MotionText,
  parameters: {
    layout: "centered",
  },
  title: "shared/components/motion-text",
} satisfies Meta<typeof MotionText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Hello World",
  },
};

export const WordByWord: Story = {
  args: {
    children: "This text animates word by word",
    mode: "words",
  },
};

export const CharacterByCharacter: Story = {
  args: {
    children: "Character animation",
    mode: "characters",
  },
};

export const AsHeading: Story = {
  args: {
    as: "h1",
    children: "Welcome to Our Site",
  },
  render: (args) => (
    <Heading size="2xl">
      <MotionText {...args} />
    </Heading>
  ),
};

export const AsParagraph: Story = {
  args: {
    as: "p",
    children: "This is a paragraph with animated text that reveals word by word as you scroll into view.",
  },
};

export const FadeIn: Story = {
  args: {
    children: "Fade in animation",
    variant: "fadeIn",
  },
};

export const SlideInUp: Story = {
  args: {
    children: "Slide up animation",
    variant: "slideInUp",
  },
};

export const BounceIn: Story = {
  args: {
    children: "Bouncy text",
    variant: "bounceIn",
  },
};

export const FastStagger: Story = {
  args: {
    children: "Quick reveal animation",
    staggerDelay: "fast",
  },
};

export const SlowStagger: Story = {
  args: {
    children: "Slow dramatic reveal",
    staggerDelay: "slow",
  },
};

export const WithDelay: Story = {
  args: {
    children: "Delayed start animation",
    delay: 0.5,
  },
};

export const LongText: Story = {
  args: {
    children:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    mode: "words",
  },
  render: (args) => (
    <Box maxW="400px">
      <MotionText {...args} />
    </Box>
  ),
};

export const AllHeadingLevels: Story = {
  args: {
    children: "Heading",
  },
  render: () => (
    <VStack align="start" gap={4}>
      <Heading size="2xl">
        <MotionText as="h1">Heading 1</MotionText>
      </Heading>
      <Heading size="xl">
        <MotionText as="h2" delay={0.2}>
          Heading 2
        </MotionText>
      </Heading>
      <Heading size="lg">
        <MotionText as="h3" delay={0.4}>
          Heading 3
        </MotionText>
      </Heading>
      <Heading size="md">
        <MotionText as="h4" delay={0.6}>
          Heading 4
        </MotionText>
      </Heading>
    </VStack>
  ),
};

export const DifferentVariants: Story = {
  args: {
    children: "Variants",
  },
  render: () => (
    <VStack align="start" gap={6}>
      <Box>
        <MotionText variant="fadeInUp">Fade In Up</MotionText>
      </Box>
      <Box>
        <MotionText delay={0.2} variant="fadeInLeft">
          Fade In Left
        </MotionText>
      </Box>
      <Box>
        <MotionText delay={0.4} variant="fadeInRight">
          Fade In Right
        </MotionText>
      </Box>
      <Box>
        <MotionText delay={0.6} variant="scaleIn">
          Scale In
        </MotionText>
      </Box>
    </VStack>
  ),
};

export const Disabled: Story = {
  args: {
    children: "Animation disabled",
    disabled: true,
  },
};
