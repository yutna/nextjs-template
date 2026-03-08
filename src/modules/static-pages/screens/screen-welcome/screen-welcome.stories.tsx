import { ScreenWelcome } from "./screen-welcome";

import type { Meta, StoryContext, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  args: {
    locale: "en",
  },
  component: ScreenWelcome,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
      },
    },
  },
  title: "modules/static-pages/screens/screen-welcome",
} satisfies Meta<typeof ScreenWelcome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (_, context: StoryContext) => (
    <ScreenWelcome locale={(context.globals["locale"] as string) || "en"} />
  ),
};
