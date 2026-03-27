import { LandingCta } from "./landing-cta";

import type { Meta, StoryContext, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  args: {
    locale: "en",
  },
  component: LandingCta,
  parameters: {
    layout: "fullscreen",
  },
  title: "features/landing/components/landing-cta",
} satisfies Meta<typeof LandingCta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (_, context: StoryContext) => (
    <LandingCta locale={(context.globals["locale"] as string) || "en"} />
  ),
};
