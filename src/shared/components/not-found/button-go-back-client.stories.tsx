import { ButtonGoBackClient } from "./button-go-back-client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: ButtonGoBackClient,
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
  },
  title: "shared/components/not-found/button-go-back-client",
} satisfies Meta<typeof ButtonGoBackClient>;

export default meta;
type Story = StoryObj<typeof meta>;

export const English: Story = {
  args: {
    label: "Go Back",
  },
};

export const Thai: Story = {
  args: {
    label: "ย้อนกลับ",
  },
};
