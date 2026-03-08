import { ContainerLandingHero } from "./container-landing-hero";

import type { Meta, StoryContext, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  args: {
    locale: "en",
  },
  component: ContainerLandingHero,
  parameters: {
    layout: "fullscreen",
  },
  title: "modules/static-pages/containers/container-landing-hero",
} satisfies Meta<typeof ContainerLandingHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (_, context: StoryContext) => (
    <ContainerLandingHero
      locale={(context.globals["locale"] as string) || "en"}
    />
  ),
};
