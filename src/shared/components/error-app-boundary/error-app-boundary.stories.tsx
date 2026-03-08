import { ErrorAppBoundary } from "./error-app-boundary";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: ErrorAppBoundary,
  parameters: {
    layout: "fullscreen",
  },
  title: "shared/components/error-app-boundary",
} satisfies Meta<typeof ErrorAppBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    error: Object.assign(new Error("Something went wrong"), {
      digest: "test-digest-123",
    }),
    reset: () => {
      // reset handler
    },
  },
};
