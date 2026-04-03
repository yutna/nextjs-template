import { Box, Card, Heading, Text, VStack } from "@chakra-ui/react";

import { MotionScroll } from "./motion-scroll";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: MotionScroll,
  parameters: {
    layout: "fullscreen",
  },
  title: "shared/components/motion-scroll",
} satisfies Meta<typeof MotionScroll>;

export default meta;
type Story = StoryObj<typeof meta>;

const ScrollContainer = ({ children }: { children: React.ReactNode }) => (
  <Box h="300vh" py={20}>
    <VStack gap={8} maxW="600px" mx="auto" px={4}>
      <Box h="50vh">
        <Text color="fg.muted">Scroll down to see animations...</Text>
      </Box>
      {children}
      <Box h="50vh">
        <Text color="fg.muted">Keep scrolling...</Text>
      </Box>
    </VStack>
  </Box>
);

export const FadeOnScroll: Story = {
  args: {
    children: (
      <Card.Root>
        <Card.Body>
          <Heading size="md">Fade In</Heading>
          <Text>This card fades in as you scroll.</Text>
        </Card.Body>
      </Card.Root>
    ),
    style: { opacity: [0, 1] },
  },
  render: (args) => (
    <ScrollContainer>
      <MotionScroll {...args} />
    </ScrollContainer>
  ),
};

export const ScaleOnScroll: Story = {
  args: {
    children: (
      <Card.Root>
        <Card.Body>
          <Heading size="md">Scale In</Heading>
          <Text>This card scales up as you scroll.</Text>
        </Card.Body>
      </Card.Root>
    ),
    style: { opacity: [0, 1], scale: [0.8, 1] },
  },
  render: (args) => (
    <ScrollContainer>
      <MotionScroll {...args} />
    </ScrollContainer>
  ),
};

export const HorizontalSlide: Story = {
  args: {
    children: (
      <Card.Root>
        <Card.Body>
          <Heading size="md">Slide from Left</Heading>
          <Text>This card slides in from the left.</Text>
        </Card.Body>
      </Card.Root>
    ),
    style: { opacity: [0, 1], x: [-100, 0] },
  },
  render: (args) => (
    <ScrollContainer>
      <MotionScroll {...args} />
      <MotionScroll style={{ opacity: [0, 1], x: [100, 0] }}>
        <Card.Root>
          <Card.Body>
            <Heading size="md">Slide from Right</Heading>
            <Text>This card slides in from the right.</Text>
          </Card.Body>
        </Card.Root>
      </MotionScroll>
    </ScrollContainer>
  ),
};

export const RotateOnScroll: Story = {
  args: {
    children: (
      <Card.Root>
        <Card.Body>
          <Heading size="md">Rotate In</Heading>
          <Text>This card rotates as you scroll.</Text>
        </Card.Body>
      </Card.Root>
    ),
    style: { opacity: [0.5, 1], rotate: [-10, 0] },
  },
  render: (args) => (
    <ScrollContainer>
      <MotionScroll {...args} />
    </ScrollContainer>
  ),
};

export const CombinedEffects: Story = {
  args: {
    children: (
      <Card.Root>
        <Card.Body>
          <Heading size="md">Combined Effects</Heading>
          <Text>Scale, fade, and vertical movement combined.</Text>
        </Card.Body>
      </Card.Root>
    ),
    style: {
      opacity: [0, 1],
      scale: [0.9, 1],
      y: [50, 0],
    },
  },
  render: (args) => (
    <ScrollContainer>
      <MotionScroll {...args} />
    </ScrollContainer>
  ),
};

export const AsDifferentElement: Story = {
  args: {
    as: "section",
    children: "Section Element",
    style: { opacity: [0, 1] },
  },
  render: (args) => (
    <ScrollContainer>
      <MotionScroll {...args}>
        <Box
          bg={{ _dark: "gray.800", base: "gray.100" }}
          borderRadius="md"
          p={8}
        >
          <Heading mb={4} size="lg">
            Section Element
          </Heading>
          <Text>This MotionScroll renders as a semantic section element.</Text>
        </Box>
      </MotionScroll>
    </ScrollContainer>
  ),
};

export const Disabled: Story = {
  args: {
    children: (
      <Card.Root>
        <Card.Body>
          <Heading size="md">Disabled</Heading>
          <Text>Animation is disabled, content appears normally.</Text>
        </Card.Body>
      </Card.Root>
    ),
    disabled: true,
    style: { opacity: [0, 1], scale: [0.8, 1] },
  },
  render: (args) => (
    <ScrollContainer>
      <MotionScroll {...args} />
    </ScrollContainer>
  ),
};
