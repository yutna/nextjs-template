import type { FieldErrors } from "@/shared/lib/errors/types";

export interface UseReferenceNoteFormReturn {
  fieldErrors: FieldErrors;
  isSubmitting: boolean;
  message: string;
  title: string;

  handleChangeMessage: (value: string) => void;
  handleChangeTitle: (value: string) => void;
  handleSubmit: () => Promise<void>;

  serverError?: string;
  submittedMessage?: string;
  submittedTitle?: string;
  submittedWordCountLabel?: string;
}
