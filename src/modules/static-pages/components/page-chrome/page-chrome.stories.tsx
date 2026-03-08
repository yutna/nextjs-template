import { PageChrome } from "./page-chrome";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: PageChrome,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
      },
    },
  },
  title: "modules/static-pages/components/page-chrome",
} satisfies Meta<typeof PageChrome>;

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
