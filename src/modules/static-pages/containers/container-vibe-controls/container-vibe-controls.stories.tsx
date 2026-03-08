import { VibeProvider } from "@/modules/static-pages/providers/vibe-provider";

import { ContainerVibeControls } from "./container-vibe-controls";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: ContainerVibeControls,
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
  title: "modules/static-pages/containers/container-vibe-controls",
} satisfies Meta<typeof ContainerVibeControls>;

export default meta;
type Story = StoryObj<typeof meta>;

// Vibe toggle + volume slider — visible on desktop (≥768px).
// On mobile the component renders null.
export const Default: Story = {};
