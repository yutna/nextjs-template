import { PageChrome } from "./page-chrome.client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: PageChrome,
  parameters: {
    layout: "fullscreen",
  },
  title: "features/landing/components/page-chrome",
} satisfies Meta<typeof PageChrome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const English: Story = {
  args: {
    locale: "en",
    onSwitchLocale: () => undefined,
  },
};

export const Thai: Story = {
  args: {
    locale: "th",
    onSwitchLocale: () => undefined,
  },
};
