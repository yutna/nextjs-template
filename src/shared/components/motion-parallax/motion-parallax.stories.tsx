import { Box, Card, Heading, Text, VStack } from "@chakra-ui/react";

import { MotionParallax } from "./motion-parallax";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: MotionParallax,
  parameters: {
    layout: "fullscreen",
  },
  title: "shared/components/motion-parallax",
} satisfies Meta<typeof MotionParallax>;

export default meta;
type Story = StoryObj<typeof meta>;

const ScrollContainer = ({ children }: { children: React.ReactNode }) => (
  <Box h="300vh" py={20}>
    <VStack gap={8} maxW="600px" mx="auto" px={4}>
      <Box h="50vh">
        <Text color="fg.muted">Scroll down to see parallax effect...</Text>
      </Box>
      {children}
      <Box h="50vh">
        <Text color="fg.muted">Keep scrolling...</Text>
      </Box>
    </VStack>
  </Box>
);

export const Default: Story = {
  args: {
    children: (
      <Card.Root>
        <Card.Body>
          <Heading size="md">Parallax Card</Heading>
          <Text>This card moves at a different speed than scroll.</Text>
        </Card.Body>
      </Card.Root>
    ),
  },
  render: (args) => (
    <ScrollContainer>
      <MotionParallax {...args} />
    </ScrollContainer>
  ),
};

export const SlowParallax: Story = {
  args: {
    children: (
      <Card.Root>
        <Card.Body>
          <Heading size="md">Slow Parallax</Heading>
          <Text>Moves slower than scroll (background effect).</Text>
        </Card.Body>
      </Card.Root>
    ),
    speed: 0.3,
  },
  render: (args) => (
    <ScrollContainer>
      <MotionParallax {...args} />
    </ScrollContainer>
  ),
};

export const FastParallax: Story = {
  args: {
    children: (
      <Card.Root>
        <Card.Body>
          <Heading size="md">Fast Parallax</Heading>
          <Text>Moves faster than scroll (foreground effect).</Text>
        </Card.Body>
      </Card.Root>
    ),
    speed: -0.3,
  },
  render: (args) => (
    <ScrollContainer>
      <MotionParallax {...args} />
    </ScrollContainer>
  ),
};

export const ParallaxLayers: Story = {
  args: {
    children: null,
  },
  render: () => (
    <ScrollContainer>
      <Box h="400px" position="relative" w="100%">
        <MotionParallax speed={0.2}>
          <Box
            bg="blue.100"
            borderRadius="lg"
            h="300px"
            left="10%"
            position="absolute"
            top="0"
            w="80%"
          />
        </MotionParallax>
        <MotionParallax speed={0.5}>
          <Box
            bg="green.200"
            borderRadius="lg"
            h="200px"
            left="20%"
            position="absolute"
            top="50px"
            w="60%"
          />
        </MotionParallax>
        <MotionParallax speed={-0.2}>
          <Box
            bg="purple.300"
            borderRadius="lg"
            h="150px"
            left="30%"
            position="absolute"
            top="100px"
            w="40%"
          />
        </MotionParallax>
      </Box>
    </ScrollContainer>
  ),
};

export const Disabled: Story = {
  args: {
    children: (
      <Card.Root>
        <Card.Body>
          <Heading size="md">Disabled Parallax</Heading>
          <Text>No parallax effect when disabled.</Text>
        </Card.Body>
      </Card.Root>
    ),
    disabled: true,
  },
  render: (args) => (
    <ScrollContainer>
      <MotionParallax {...args} />
    </ScrollContainer>
  ),
};
