import { LandingAiWorkflow } from "./landing-ai-workflow";

import type { Meta, StoryContext, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  args: {
    locale: "en",
  },
  component: LandingAiWorkflow,
  parameters: {
    layout: "fullscreen",
  },
  title: "modules/static-pages/components/landing-ai-workflow",
} satisfies Meta<typeof LandingAiWorkflow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (_, context: StoryContext) => (
    <LandingAiWorkflow locale={(context.globals["locale"] as string) || "en"} />
  ),
};
