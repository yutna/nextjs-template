import { LoadingGlobal } from "./loading-global";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: LoadingGlobal,
  parameters: {
    layout: "fullscreen",
  },
  title: "shared/components/loading-global",
} satisfies Meta<typeof LoadingGlobal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
