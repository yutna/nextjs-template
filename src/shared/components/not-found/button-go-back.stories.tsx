import { ButtonGoBack } from "./button-go-back";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: ButtonGoBack,
  parameters: {
    layout: "centered",
  },
  title: "shared/components/not-found/button-go-back",
} satisfies Meta<typeof ButtonGoBack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const English: Story = {
  args: {
    label: "Go Back",
    onClick: () => undefined,
  },
};

export const Thai: Story = {
  args: {
    label: "ย้อนกลับ",
    onClick: () => undefined,
  },
};
