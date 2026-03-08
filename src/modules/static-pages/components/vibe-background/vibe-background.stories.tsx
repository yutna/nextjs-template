import { VibeProvider } from "@/modules/static-pages/providers/vibe-provider";

import { VibeBackground } from "./vibe-background";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: VibeBackground,
  decorators: [
    (Story) => (
      <VibeProvider>
        <Story />
      </VibeProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
  title: "modules/static-pages/components/vibe-background",
} satisfies Meta<typeof VibeBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

// On desktop the YouTube iframe renders behind the hero. On mobile the
// component renders null (matchMedia below 768px returns false in jsdom).
export const Default: Story = {};
