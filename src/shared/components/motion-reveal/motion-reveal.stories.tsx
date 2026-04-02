import { Box, Card, Heading, Text, VStack } from "@chakra-ui/react";

import { MotionReveal } from "./motion-reveal";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: MotionReveal,
  parameters: {
    layout: "padded",
  },
  title: "shared/components/motion-reveal",
} satisfies Meta<typeof MotionReveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <Card.Root>
        <Card.Body>
          <Text>This content fades in when scrolled into view.</Text>
        </Card.Body>
      </Card.Root>
    ),
  },
};

export const FadeInUp: Story = {
  args: {
    children: (
      <Card.Root>
        <Card.Body>
          <Heading size="md">Fade In Up</Heading>
          <Text>Content slides up while fading in.</Text>
        </Card.Body>
      </Card.Root>
    ),
    variant: "fadeInUp",
  },
};

export const SlideInLeft: Story = {
  args: {
    children: (
      <Card.Root>
        <Card.Body>
          <Heading size="md">Slide In Left</Heading>
          <Text>Content slides in from the left.</Text>
        </Card.Body>
      </Card.Root>
    ),
    variant: "slideInLeft",
  },
};

export const SlideInRight: Story = {
  args: {
    children: (
      <Card.Root>
        <Card.Body>
          <Heading size="md">Slide In Right</Heading>
          <Text>Content slides in from the right.</Text>
        </Card.Body>
      </Card.Root>
    ),
    variant: "slideInRight",
  },
};

export const BounceIn: Story = {
  args: {
    children: (
      <Card.Root>
        <Card.Body>
          <Heading size="md">Bounce In</Heading>
          <Text>Content bounces in with a playful spring effect.</Text>
        </Card.Body>
      </Card.Root>
    ),
    variant: "bounceIn",
  },
};

export const ScaleIn: Story = {
  args: {
    children: (
      <Card.Root>
        <Card.Body>
          <Heading size="md">Scale In</Heading>
          <Text>Content scales up while fading in.</Text>
        </Card.Body>
      </Card.Root>
    ),
    variant: "scaleIn",
  },
};

export const FlipInX: Story = {
  args: {
    children: (
       
      <Box style={{ perspective: "1000px" }}>
        <Card.Root>
          <Card.Body>
            <Heading size="md">Flip In X</Heading>
            <Text>Content flips in along the X axis.</Text>
          </Card.Body>
        </Card.Root>
      </Box>
    ),
    variant: "flipInX",
  },
};

export const WithDelay: Story = {
  args: {
    children: (
      <Card.Root>
        <Card.Body>
          <Heading size="md">Delayed Animation</Heading>
          <Text>This animation starts after a 0.5 second delay.</Text>
        </Card.Body>
      </Card.Root>
    ),
    delay: 0.5,
    variant: "fadeInUp",
  },
};

export const SlowDuration: Story = {
  args: {
    children: (
      <Card.Root>
        <Card.Body>
          <Heading size="md">Slow Duration</Heading>
          <Text>This animation uses a slower duration for a dramatic effect.</Text>
        </Card.Body>
      </Card.Root>
    ),
    duration: "slower",
    variant: "fadeInUp",
  },
};

export const AsSection: Story = {
  args: {
    as: "section",
    children: (
      <Box bg={{ _dark: "gray.800", base: "gray.100" }} borderRadius="md" p={8}>
        <Heading mb={4} size="lg">
          Section Element
        </Heading>
        <Text>This MotionReveal renders as a semantic section element.</Text>
      </Box>
    ),
    variant: "fadeIn",
  },
};

export const AllVariants: Story = {
  args: {
    children: null,
  },
  render: () => (
    <VStack align="stretch" gap={8}>
      {(
        [
          "fadeIn",
          "fadeInUp",
          "fadeInDown",
          "fadeInLeft",
          "fadeInRight",
          "scaleIn",
          "scaleInUp",
          "slideInLeft",
          "slideInRight",
          "bounceIn",
          "bounceInUp",
        ] as const
      ).map((variant, index) => (
        <MotionReveal delay={index * 0.1} key={variant} variant={variant}>
          <Card.Root>
            <Card.Body>
              <Heading size="sm">{variant}</Heading>
              <Text color="fg.muted" fontSize="sm">
                Animation variant: {variant}
              </Text>
            </Card.Body>
          </Card.Root>
        </MotionReveal>
      ))}
    </VStack>
  ),
};

export const Disabled: Story = {
  args: {
    children: (
      <Card.Root>
        <Card.Body>
          <Heading size="md">Disabled Animation</Heading>
          <Text>Animation is disabled, content appears immediately.</Text>
        </Card.Body>
      </Card.Root>
    ),
    disabled: true,
    variant: "bounceIn",
  },
};
