import { LandingFooter } from "./landing-footer";

import type { Meta, StoryContext, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  args: {
    locale: "en",
  },
  component: LandingFooter,
  parameters: {
    layout: "fullscreen",
  },
  title: "modules/static-pages/components/landing-footer",
} satisfies Meta<typeof LandingFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (_, context: StoryContext) => (
    <LandingFooter locale={(context.globals["locale"] as string) || "en"} />
  ),
};
