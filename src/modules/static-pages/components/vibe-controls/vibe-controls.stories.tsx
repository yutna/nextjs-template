import { VibeControls } from "./vibe-controls";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  args: {
    isDesktop: true,
    isVibeOn: true,
    onVibeToggle: () => {},
    onVolumeChange: () => {},
    volume: 15,
  },
  component: VibeControls,
  parameters: {
    layout: "centered",
  },
  title: "modules/static-pages/components/vibe-controls",
} satisfies Meta<typeof VibeControls>;

export default meta;
type Story = StoryObj<typeof meta>;

// Vibe toggle + volume slider — visible on desktop (isDesktop: true).
export const Default: Story = {};

export const VibeOff: Story = {
  args: { isVibeOn: false },
};

export const Mobile: Story = {
  args: { isDesktop: false },
};
