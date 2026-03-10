import { PreviewTheme } from "./preview-theme";

import type { Meta, StoryContext, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  args: {
    activePreviewGroup: "overview",
    colorMode: "light",
    hasPendingChanges: true,
    locale: "en",
    onChangePreviewGroup: () => undefined,
    onClickReset: () => undefined,
    onClickSave: () => undefined,
    onSwitchColorMode: () => undefined,
    onSwitchLocale: () => undefined,
    presetId: "default",
  },
  component: PreviewTheme,
  parameters: {
    layout: "padded",
  },
  title: "modules/theme-settings/components/preview-theme",
} satisfies Meta<typeof PreviewTheme>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args, context: StoryContext) => (
    <PreviewTheme
      {...args}
      colorMode={(context.globals["colorMode"] as "dark" | "light") || "light"}
      locale={(context.globals["locale"] as "en" | "th") || "en"}
    />
  ),
};
