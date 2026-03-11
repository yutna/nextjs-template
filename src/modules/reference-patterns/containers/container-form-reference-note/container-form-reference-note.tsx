"use client";

import { useTranslations } from "next-intl";

import { FormReferenceNote } from "@/modules/reference-patterns/components/form-reference-note";
import { useReferenceNoteForm } from "@/modules/reference-patterns/hooks/use-reference-note-form";
import {
  REFERENCE_NOTE_MESSAGE_MAX_LENGTH,
  REFERENCE_NOTE_TITLE_MAX_LENGTH,
} from "@/modules/reference-patterns/schemas/reference-note";

export function ContainerFormReferenceNote() {
  const t = useTranslations(
    "modules.referencePatterns.components.formReferenceNote",
  );
  const {
    fieldErrors,
    handleChangeMessage,
    handleChangeTitle,
    handleSubmit,
    isSubmitting,
    message,
    serverError,
    submittedMessage,
    submittedTitle,
    submittedWordCountLabel,
    title,
  } = useReferenceNoteForm();

  return (
    <FormReferenceNote
      description={t("description")}
      emptyPreviewDescription={t("emptyPreviewDescription")}
      emptyPreviewTitle={t("emptyPreviewTitle")}
      fieldErrors={fieldErrors}
      heading={t("heading")}
      helperText={t("helperText", {
        messageCount: REFERENCE_NOTE_MESSAGE_MAX_LENGTH,
        titleCount: REFERENCE_NOTE_TITLE_MAX_LENGTH,
      })}
      isSubmitting={isSubmitting}
      message={message}
      messageLabel={t("messageLabel")}
      messagePlaceholder={t("messagePlaceholder")}
      onMessageChange={handleChangeMessage}
      onSubmit={handleSubmit}
      onTitleChange={handleChangeTitle}
      previewDescription={t("previewDescription")}
      previewHeading={t("previewHeading")}
      serverError={serverError}
      submitLabel={t("submitLabel")}
      submittedMessage={submittedMessage}
      submittedTitle={submittedTitle}
      submittedWordCountLabel={submittedWordCountLabel}
      submittingLabel={t("submittingLabel")}
      title={title}
      titleLabel={t("titleLabel")}
      titlePlaceholder={t("titlePlaceholder")}
    />
  );
}
