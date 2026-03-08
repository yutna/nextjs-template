import { VibeProvider } from "@/modules/static-pages/providers/vibe-provider";

import { ContainerVibeBackground } from "./container-vibe-background";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: ContainerVibeBackground,
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
  title: "modules/static-pages/containers/container-vibe-background",
} satisfies Meta<typeof ContainerVibeBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

// On desktop the YouTube iframe renders behind the hero.
// On mobile the component renders null (matchMedia below 768px).
export const Default: Story = {};
