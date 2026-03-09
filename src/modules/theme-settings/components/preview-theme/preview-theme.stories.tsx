import { PreviewTheme } from "./preview-theme";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: PreviewTheme,
  parameters: {
    layout: "padded",
  },
  title: "modules/theme-settings/components/preview-theme",
} satisfies Meta<typeof PreviewTheme>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
