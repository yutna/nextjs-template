import { CopyCommand } from "./copy-command";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: CopyCommand,
  parameters: {
    layout: "centered",
  },
  title: "modules/static-pages/components/copy-command",
} satisfies Meta<typeof CopyCommand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
