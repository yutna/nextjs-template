"use client";

import { useTranslations } from "next-intl";
import { useImmer } from "use-immer";

import { submitReferenceNoteAction } from "@/modules/reference-patterns/actions/submit-reference-note-action";

import type { FieldErrors } from "@/shared/lib/errors/types";
import type { UseReferenceNoteFormReturn } from "./types";

interface UseReferenceNoteFormState {
  fieldErrors: FieldErrors;
  isSubmitting: boolean;
  message: string;
  title: string;

  serverError?: string;
  submittedMessage?: string;
  submittedTitle?: string;
  submittedWordCountLabel?: string;
}

type SubmitReferenceNoteResult = Awaited<
  ReturnType<typeof submitReferenceNoteAction>
>;

const INITIAL_STATE: UseReferenceNoteFormState = {
  fieldErrors: {},
  isSubmitting: false,
  message: "",
  title: "",
};

function buildFieldErrors(
  validationErrors: SubmitReferenceNoteResult["validationErrors"],
): FieldErrors {
  const fieldErrors: FieldErrors = {};

  if (validationErrors?.title?._errors?.length) {
    fieldErrors.title = validationErrors.title._errors;
  }

  if (validationErrors?.message?._errors?.length) {
    fieldErrors.message = validationErrors.message._errors;
  }

  return fieldErrors;
}

export function useReferenceNoteForm(): UseReferenceNoteFormReturn {
  const t = useTranslations("modules.referencePatterns.hooks.useReferenceNoteForm");
  const [state, updateState] = useImmer(INITIAL_STATE);

  function handleChangeTitle(value: string) {
    updateState((draft) => {
      draft.serverError = undefined;
      draft.title = value;

      delete draft.fieldErrors.title;
    });
  }

  function handleChangeMessage(value: string) {
    updateState((draft) => {
      draft.message = value;
      draft.serverError = undefined;

      delete draft.fieldErrors.message;
    });
  }

  async function handleSubmit() {
    if (state.isSubmitting) {
      return;
    }

    updateState((draft) => {
      draft.fieldErrors = {};
      draft.isSubmitting = true;
      draft.serverError = undefined;
    });

    const result = await submitReferenceNoteAction({
      message: state.message,
      title: state.title,
    });

    if (result?.validationErrors) {
      updateState((draft) => {
        draft.fieldErrors = buildFieldErrors(result.validationErrors);
        draft.isSubmitting = false;
      });
      return;
    }

    if (result?.serverError) {
      updateState((draft) => {
        draft.isSubmitting = false;
        draft.serverError = result.serverError;
      });
      return;
      }

      if (result?.data) {
        const submittedData = result.data;

        updateState((draft) => {
          draft.fieldErrors = {};
          draft.isSubmitting = false;
          draft.message = "";
          draft.serverError = undefined;
          draft.submittedMessage = submittedData.message;
          draft.submittedTitle = submittedData.title;
          draft.submittedWordCountLabel = t("wordCount", {
            count: submittedData.wordCount,
          });
          draft.title = "";
        });
        return;
      }

    updateState((draft) => {
      draft.isSubmitting = false;
      draft.serverError = t("unexpectedError");
    });
  }

  return {
    fieldErrors: state.fieldErrors,
    handleChangeMessage,
    handleChangeTitle,
    handleSubmit,
    isSubmitting: state.isSubmitting,
    message: state.message,
    serverError: state.serverError,
    submittedMessage: state.submittedMessage,
    submittedTitle: state.submittedTitle,
    submittedWordCountLabel: state.submittedWordCountLabel,
    title: state.title,
  };
}
