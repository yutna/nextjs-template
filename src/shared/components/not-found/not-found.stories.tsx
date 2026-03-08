import { NotFound } from "./not-found";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: NotFound,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
  title: "shared/components/not-found",
} satisfies Meta<typeof NotFound>;

export default meta;
type Story = StoryObj<typeof meta>;

// Locale is derived from `getLocale()` in the mock, which reads
// the toolbar's global locale set by the preview decorator.
export const Default: Story = {};
