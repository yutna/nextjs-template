import { ErrorGlobal } from "./error-global";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: ErrorGlobal,
  parameters: {
    layout: "fullscreen",
  },
  title: "shared/components/error-global",
} satisfies Meta<typeof ErrorGlobal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    error: Object.assign(new Error("Critical application error"), {
      digest: "global-digest-456",
    }),
    reset: () => {
      // reset handler
    },
  },
};
