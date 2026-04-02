import { Card, Heading, Text, VStack } from "@chakra-ui/react";

import { MotionStagger } from "./motion-stagger";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: MotionStagger,
  parameters: {
    layout: "padded",
  },
  title: "shared/components/motion-stagger",
} satisfies Meta<typeof MotionStagger>;

export default meta;
type Story = StoryObj<typeof meta>;

const SampleCard = ({ index, title }: { index: number; title: string; }) => (
  <Card.Root>
    <Card.Body>
      <Heading size="sm">{title}</Heading>
      <Text color="fg.muted" fontSize="sm">
        Card #{index + 1}
      </Text>
    </Card.Body>
  </Card.Root>
);

export const Default: Story = {
  args: {
    children: [
      <SampleCard index={0} key="1" title="First Card" />,
      <SampleCard index={1} key="2" title="Second Card" />,
      <SampleCard index={2} key="3" title="Third Card" />,
    ],
  },
};

export const FadeInUp: Story = {
  args: {
    children: [
      <SampleCard index={0} key="1" title="Fade Up 1" />,
      <SampleCard index={1} key="2" title="Fade Up 2" />,
      <SampleCard index={2} key="3" title="Fade Up 3" />,
    ],
    itemVariant: "fadeInUp",
  },
};

export const SlideInLeft: Story = {
  args: {
    children: [
      <SampleCard index={0} key="1" title="Slide Left 1" />,
      <SampleCard index={1} key="2" title="Slide Left 2" />,
      <SampleCard index={2} key="3" title="Slide Left 3" />,
    ],
    itemVariant: "slideInLeft",
  },
};

export const SlideInRight: Story = {
  args: {
    children: [
      <SampleCard index={0} key="1" title="Slide Right 1" />,
      <SampleCard index={1} key="2" title="Slide Right 2" />,
      <SampleCard index={2} key="3" title="Slide Right 3" />,
    ],
    itemVariant: "slideInRight",
  },
};

export const BounceIn: Story = {
  args: {
    children: [
      <SampleCard index={0} key="1" title="Bounce 1" />,
      <SampleCard index={1} key="2" title="Bounce 2" />,
      <SampleCard index={2} key="3" title="Bounce 3" />,
    ],
    itemVariant: "bounceIn",
  },
};

export const FastStagger: Story = {
  args: {
    children: [
      <SampleCard index={0} key="1" title="Fast 1" />,
      <SampleCard index={1} key="2" title="Fast 2" />,
      <SampleCard index={2} key="3" title="Fast 3" />,
      <SampleCard index={3} key="4" title="Fast 4" />,
      <SampleCard index={4} key="5" title="Fast 5" />,
    ],
    staggerDelay: "fast",
  },
};

export const SlowStagger: Story = {
  args: {
    children: [
      <SampleCard index={0} key="1" title="Slow 1" />,
      <SampleCard index={1} key="2" title="Slow 2" />,
      <SampleCard index={2} key="3" title="Slow 3" />,
    ],
    staggerDelay: "slow",
  },
};

export const ReverseStagger: Story = {
  args: {
    children: [
      <SampleCard index={0} key="1" title="Reverse 1" />,
      <SampleCard index={1} key="2" title="Reverse 2" />,
      <SampleCard index={2} key="3" title="Reverse 3" />,
    ],
    staggerReverse: true,
  },
};

export const DelayedStart: Story = {
  args: {
    children: [
      <SampleCard index={0} key="1" title="Delayed 1" />,
      <SampleCard index={1} key="2" title="Delayed 2" />,
      <SampleCard index={2} key="3" title="Delayed 3" />,
    ],
    delayChildren: 0.5,
  },
};

export const AsList: Story = {
  args: {
    as: "ul",
    children: [
      <Text key="1">List item 1</Text>,
      <Text key="2">List item 2</Text>,
      <Text key="3">List item 3</Text>,
    ],
    itemAs: "li",
  },
};

export const WithCustomStyling: Story = {
  args: {
    children: [
      <VStack align="stretch" gap={2} key="1">
        <Card.Root>
          <Card.Body>
            <Text>Styled item 1</Text>
          </Card.Body>
        </Card.Root>
      </VStack>,
      <VStack align="stretch" gap={2} key="2">
        <Card.Root>
          <Card.Body>
            <Text>Styled item 2</Text>
          </Card.Body>
        </Card.Root>
      </VStack>,
      <VStack align="stretch" gap={2} key="3">
        <Card.Root>
          <Card.Body>
            <Text>Styled item 3</Text>
          </Card.Body>
        </Card.Root>
      </VStack>,
    ],
    className: "custom-stagger",
    itemClassName: "custom-item",
    itemVariant: "scaleIn",
    staggerDelay: 0.08,
  },
};

export const Disabled: Story = {
  args: {
    children: [
      <SampleCard index={0} key="1" title="Disabled 1" />,
      <SampleCard index={1} key="2" title="Disabled 2" />,
      <SampleCard index={2} key="3" title="Disabled 3" />,
    ],
    disabled: true,
  },
};
