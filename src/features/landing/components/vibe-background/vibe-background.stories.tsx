import { VibeBackground } from "./vibe-background.client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  args: {
    iframeRef: { current: null },
    isDesktop: true,
    isVibeOn: true,
    onLoadIframe: () => {},
  },
  component: VibeBackground,
  parameters: {
    layout: "fullscreen",
  },
  title: "features/landing/components/vibe-background",
} satisfies Meta<typeof VibeBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

// YouTube iframe fills the viewport with the looping meme video.
// On mobile (isDesktop: false) the component renders null.
export const Default: Story = {};

export const VibeOff: Story = {
  args: { isVibeOn: false },
};

export const Mobile: Story = {
  args: { isDesktop: false },
};
