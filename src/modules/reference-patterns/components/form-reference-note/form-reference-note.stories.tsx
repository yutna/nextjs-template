import { FormReferenceNote } from "./form-reference-note";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: FormReferenceNote,
  parameters: {
    layout: "fullscreen",
  },
  title: "modules/reference-patterns/components/form-reference-note",
} satisfies Meta<typeof FormReferenceNote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    description:
      "Submit a short note to see the container → hook → action → schema flow with a minimal client boundary.",
    emptyPreviewDescription:
      "Submit the form to see the validated payload come back from the server.",
    emptyPreviewTitle: "No preview yet",
    fieldErrors: {},
    heading: "Interactive example: action-backed note preview",
    helperText:
      "This form uses a client container plus hook and submits to a server action validated by Zod.",
    isSubmitting: false,
    message: "",
    messageLabel: "Message",
    messagePlaceholder: "Describe what changed and why it matters",
    onMessageChange: () => undefined,
    onSubmit: async () => undefined,
    onTitleChange: () => undefined,
    previewDescription:
      "The box below renders the normalized data returned from the server action.",
    previewHeading: "Last submitted preview",
    submitLabel: "Generate preview",
    submittingLabel: "Generating preview...",
    title: "",
    titleLabel: "Title",
    titlePlaceholder: "Summarize the change in one line",
  },
};

export const WithPreview: Story = {
  args: {
    ...Default.args,
    submittedMessage: "Ship cleaner UI states",
    submittedTitle: "Release note",
    submittedWordCountLabel: "Word count: 4",
  },
};
