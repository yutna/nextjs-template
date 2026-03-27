import { CopyCommand } from "./copy-command.client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: CopyCommand,
  parameters: {
    layout: "centered",
  },
  title: "features/landing/components/copy-command",
} satisfies Meta<typeof CopyCommand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isCopied: false,
    isVibeOn: false,
    onCopy: () => undefined,
  },
};

export const Copied: Story = {
  args: {
    isCopied: true,
    isVibeOn: false,
    onCopy: () => undefined,
  },
};

export const VibeOn: Story = {
  args: {
    isCopied: false,
    isVibeOn: true,
    onCopy: () => undefined,
  },
};
