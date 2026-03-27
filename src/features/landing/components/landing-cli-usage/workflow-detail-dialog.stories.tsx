import { WorkflowDetailDialog } from "./workflow-detail-dialog.client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: WorkflowDetailDialog,
  parameters: {
    layout: "centered",
  },
  title: "features/landing/components/landing-cli-usage/workflow-detail-dialog",
} satisfies Meta<typeof WorkflowDetailDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
