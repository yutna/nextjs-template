import { LandingHero } from "./landing-hero";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  args: {
    getStarted: "GitHub",
    subtitle: "Production-ready Next.js 16 starter with opinionated conventions.",
    title: "Vibe Code\nwith Confidence",
  },
  component: LandingHero,
  parameters: {
    layout: "centered",
  },
  title: "modules/static-pages/components/landing-hero",
} satisfies Meta<typeof LandingHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
