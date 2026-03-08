import { ContainerPageChrome } from "./container-page-chrome";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: ContainerPageChrome,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
      },
    },
  },
  title: "modules/static-pages/containers/container-page-chrome",
} satisfies Meta<typeof ContainerPageChrome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const English: Story = {
  args: {
    locale: "en",
  },
};

export const Thai: Story = {
  args: {
    locale: "th",
  },
};
