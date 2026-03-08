import { ScrollIndicator } from "./scroll-indicator";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: ScrollIndicator,
  parameters: {
    layout: "centered",
  },
  title: "modules/static-pages/components/scroll-indicator",
} satisfies Meta<typeof ScrollIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
