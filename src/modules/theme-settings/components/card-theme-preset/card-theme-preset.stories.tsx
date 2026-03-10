import { CardThemePreset } from "./card-theme-preset";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  args: {
    isActive: false,
    onClickSelect: () => {},
    preset: {
      cssVars: { dark: {}, light: {} },
      id: "minimalism",
      swatches: ["#000000", "#333333", "#666666", "#CCCCCC", "#FFFFFF"],
    },
  },
  component: CardThemePreset,
  parameters: {
    layout: "centered",
  },
  title: "modules/theme-settings/components/card-theme-preset",
} satisfies Meta<typeof CardThemePreset>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Active: Story = {
  args: { isActive: true },
};

export const ShortDescription: Story = {
  args: {
    preset: {
      cssVars: { dark: {}, light: {} },
      id: "brutalism",
      swatches: ["#000000", "#FFFFFF"],
    },
  },
};
