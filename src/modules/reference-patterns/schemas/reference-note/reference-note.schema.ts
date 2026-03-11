import { z } from "zod";

export const REFERENCE_NOTE_TITLE_MAX_LENGTH = 60;
export const REFERENCE_NOTE_MESSAGE_MAX_LENGTH = 240;

export const referenceNoteSchema = z.object({
  message: z.string().trim().min(1).max(REFERENCE_NOTE_MESSAGE_MAX_LENGTH),
  title: z.string().trim().min(1).max(REFERENCE_NOTE_TITLE_MAX_LENGTH),
});
