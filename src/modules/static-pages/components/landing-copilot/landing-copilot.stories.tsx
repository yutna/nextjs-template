import { LandingCopilot } from "./landing-copilot";

import type { Meta, StoryContext, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  args: {
    locale: "en",
  },
  component: LandingCopilot,
  parameters: {
    layout: "fullscreen",
  },
  title: "modules/static-pages/components/landing-copilot",
} satisfies Meta<typeof LandingCopilot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (_, context: StoryContext) => (
    <LandingCopilot locale={(context.globals["locale"] as string) || "en"} />
  ),
};
