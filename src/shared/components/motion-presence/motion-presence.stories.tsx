"use client";

import { Box, Button, Card, HStack, Text, VStack } from "@chakra-ui/react";
import * as motion from "motion/react-client";
import { useImmer } from "use-immer";

import { fadeInUp } from "@/shared/lib/motion";

import { MotionPresence } from "./motion-presence";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: MotionPresence,
  parameters: {
    layout: "centered",
  },
  title: "shared/components/motion-presence",
} satisfies Meta<typeof MotionPresence>;

export default meta;
type Story = StoryObj<typeof meta>;

function DefaultDemo() {
  const [isVisible, setIsVisible] = useImmer(true);

  return (
    <VStack gap={4}>
      <Button onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? "Hide" : "Show"}
      </Button>
      <Box minH="100px" minW="200px">
        <MotionPresence>
          {isVisible && (
            <motion.div
              animate="visible"
              exit="exit"
              initial="hidden"
              key="card"
              variants={fadeInUp}
            >
              <Card.Root>
                <Card.Body>
                  <Text>Animated content</Text>
                </Card.Body>
              </Card.Root>
            </motion.div>
          )}
        </MotionPresence>
      </Box>
    </VStack>
  );
}

export const Default: Story = {
  args: {
    children: null,
  },
  render: () => <DefaultDemo />,
};

function WaitModeDemo() {
  const [activeTab, setActiveTab] = useImmer(0);
  const tabs = ["Tab 1", "Tab 2", "Tab 3"];

  return (
    <VStack gap={4}>
      <HStack>
        {tabs.map((tab, index) => (
          <Button
            key={tab}
            onClick={() => setActiveTab(index)}
            variant={activeTab === index ? "solid" : "outline"}
          >
            {tab}
          </Button>
        ))}
      </HStack>
      <Box minH="100px" minW="300px">
        <MotionPresence mode="wait">
          <motion.div
            animate="visible"
            exit="exit"
            initial="hidden"
            key={activeTab}
            variants={fadeInUp}
          >
            <Card.Root>
              <Card.Body>
                <Text>Content for {tabs[activeTab]}</Text>
              </Card.Body>
            </Card.Root>
          </motion.div>
        </MotionPresence>
      </Box>
    </VStack>
  );
}

export const WaitMode: Story = {
  args: {
    children: null,
  },
  render: () => <WaitModeDemo />,
};

function PopLayoutModeDemo() {
  const [items, setItems] = useImmer([1, 2, 3]);

  const handleAddItem = () => {
    setItems((draft) => {
      draft.push(Math.max(...draft) + 1);
    });
  };

  const handleRemoveItem = (id: number) => {
    setItems((draft) => {
      const index = draft.indexOf(id);
      if (index !== -1) {
        draft.splice(index, 1);
      }
    });
  };

  return (
    <VStack gap={4}>
      <Button onClick={handleAddItem}>Add Item</Button>
      <VStack gap={2} minW="200px">
        <MotionPresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              animate="visible"
              exit="exit"
              initial="hidden"
              key={item}
              layout
              variants={fadeInUp}
            >
              <Card.Root>
                <Card.Body>
                  <HStack justify="space-between">
                    <Text>Item {item}</Text>
                    <Button onClick={() => handleRemoveItem(item)} size="sm">
                      Remove
                    </Button>
                  </HStack>
                </Card.Body>
              </Card.Root>
            </motion.div>
          ))}
        </MotionPresence>
      </VStack>
    </VStack>
  );
}

export const PopLayoutMode: Story = {
  args: {
    children: null,
  },
  render: () => <PopLayoutModeDemo />,
};

function NoInitialAnimationDemo() {
  const [isVisible, setIsVisible] = useImmer(true);

  return (
    <VStack gap={4}>
      <Button onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? "Hide" : "Show"}
      </Button>
      <Box minH="100px" minW="200px">
        <MotionPresence initial={false}>
          {isVisible && (
            <motion.div
              animate="visible"
              exit="exit"
              initial="hidden"
              key="card"
              variants={fadeInUp}
            >
              <Card.Root>
                <Card.Body>
                  <Text>No initial animation (appears immediately)</Text>
                </Card.Body>
              </Card.Root>
            </motion.div>
          )}
        </MotionPresence>
      </Box>
    </VStack>
  );
}

export const NoInitialAnimation: Story = {
  args: {
    children: null,
  },
  render: () => <NoInitialAnimationDemo />,
};
