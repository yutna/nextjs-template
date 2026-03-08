import { VibeProvider } from "@/modules/static-pages/providers/vibe-provider";

import { ContainerCopyCommand } from "./container-copy-command";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: ContainerCopyCommand,
  decorators: [
    (Story) => (
      <VibeProvider>
        <Story />
      </VibeProvider>
    ),
  ],
  parameters: {
    layout: "centered",
  },
  title: "modules/static-pages/containers/container-copy-command",
} satisfies Meta<typeof ContainerCopyCommand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
