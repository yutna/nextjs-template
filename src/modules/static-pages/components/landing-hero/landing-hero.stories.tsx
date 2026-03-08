import { LandingHero } from "./landing-hero";

import type { Meta, StoryContext, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  args: {
    locale: "en",
  },
  component: LandingHero,
  parameters: {
    layout: "fullscreen",
  },
  title: "modules/static-pages/components/landing-hero",
} satisfies Meta<typeof LandingHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (_, context: StoryContext) => (
    <LandingHero locale={(context.globals["locale"] as string) || "en"} />
  ),
};
