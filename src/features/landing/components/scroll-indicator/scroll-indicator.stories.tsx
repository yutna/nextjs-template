import { ScrollIndicator } from "./scroll-indicator.client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: ScrollIndicator,
  parameters: {
    layout: "centered",
  },
  title: "features/landing/components/scroll-indicator",
} satisfies Meta<typeof ScrollIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
