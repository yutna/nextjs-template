import { LandingCliUsage } from "./landing-cli-usage";

import type { Meta, StoryContext, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  args: {
    locale: "en",
  },
  component: LandingCliUsage,
  parameters: {
    layout: "fullscreen",
  },
  title: "features/landing/components/landing-cli-usage",
} satisfies Meta<typeof LandingCliUsage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (_, context: StoryContext) => (
    <LandingCliUsage locale={(context.globals["locale"] as string) || "en"} />
  ),
};
