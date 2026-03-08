import { Box, Text } from "@chakra-ui/react";

import { ErrorBoundary } from "./error-boundary";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  args: {
    // children is always provided via story render functions
    children: null,
  },
  component: ErrorBoundary,
  parameters: {
    layout: "centered",
  },
  title: "shared/components/error-boundary",
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoError: Story = {
  render: () => (
    <ErrorBoundary
      renderFallback={({ error, reset }) => (
        <Box
          bg="red.50"
          borderColor="red.200"
          borderRadius="md"
          borderWidth="1px"
          p={4}
        >
          <Text color="red.700" fontWeight="bold">
            Error caught: {error.message}
          </Text>
          <button onClick={reset}>Retry</button>
        </Box>
      )}
    >
      <Box bg={{ _dark: "gray.800", base: "gray.100" }} borderRadius="md" p={8}>
        <Text>Content renders normally here.</Text>
      </Box>
    </ErrorBoundary>
  ),
};
