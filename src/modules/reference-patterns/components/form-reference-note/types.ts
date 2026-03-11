import type { FieldErrors } from "@/shared/lib/errors/types";

export interface FormReferenceNoteProps {
  description: string;
  emptyPreviewDescription: string;
  emptyPreviewTitle: string;
  fieldErrors: FieldErrors;
  heading: string;
  helperText: string;
  isSubmitting: boolean;
  message: string;
  messageLabel: string;
  messagePlaceholder: string;
  previewDescription: string;
  previewHeading: string;
  submitLabel: string;
  submittingLabel: string;
  title: string;
  titleLabel: string;
  titlePlaceholder: string;

  onMessageChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  onTitleChange: (value: string) => void;

  serverError?: string;
  submittedMessage?: string;
  submittedTitle?: string;
  submittedWordCountLabel?: string;
}
