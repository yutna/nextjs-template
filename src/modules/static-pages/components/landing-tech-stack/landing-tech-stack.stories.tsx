import { LandingTechStack } from "./landing-tech-stack";

import type { Meta, StoryContext, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  args: {
    locale: "en",
  },
  component: LandingTechStack,
  parameters: {
    layout: "fullscreen",
  },
  title: "modules/static-pages/components/landing-tech-stack",
} satisfies Meta<typeof LandingTechStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (_, context: StoryContext) => (
    <LandingTechStack locale={(context.globals["locale"] as string) || "en"} />
  ),
};
