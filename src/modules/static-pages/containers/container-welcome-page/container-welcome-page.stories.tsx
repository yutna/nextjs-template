import { ContainerWelcomePage } from "./container-welcome-page";

import type { Meta, StoryContext, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  args: {
    locale: "en",
  },
  component: ContainerWelcomePage,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
      },
    },
  },
  title: "modules/static-pages/containers/container-welcome-page",
} satisfies Meta<typeof ContainerWelcomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (_, context: StoryContext) => (
    <ContainerWelcomePage
      locale={(context.globals["locale"] as string) || "en"}
    />
  ),
};
