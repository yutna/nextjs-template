import { VibeProvider } from "@/modules/static-pages/providers/vibe-provider";

import { VibeControls } from "./vibe-controls";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: VibeControls,
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
  title: "modules/static-pages/components/vibe-controls",
} satisfies Meta<typeof VibeControls>;

export default meta;
type Story = StoryObj<typeof meta>;

// Vibe toggle + volume slider — visible on desktop (≥768px).
// On mobile the component renders null.
export const Default: Story = {};
