import { WorkflowDetailDialog } from "./dialog-workflow-detail";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: WorkflowDetailDialog,
  parameters: {
    layout: "centered",
  },
  title: "modules/static-pages/components/landing-cli-usage/dialog-workflow-detail",
} satisfies Meta<typeof WorkflowDetailDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
