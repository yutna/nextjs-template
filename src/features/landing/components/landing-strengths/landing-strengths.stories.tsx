import { LandingStrengths } from "./landing-strengths";

import type { Meta, StoryContext, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  args: {
    locale: "en",
  },
  component: LandingStrengths,
  parameters: {
    layout: "fullscreen",
  },
  title: "features/landing/components/landing-strengths",
} satisfies Meta<typeof LandingStrengths>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (_, context: StoryContext) => (
    <LandingStrengths locale={(context.globals["locale"] as string) || "en"} />
  ),
};
