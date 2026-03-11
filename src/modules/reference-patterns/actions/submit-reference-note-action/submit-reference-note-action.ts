"use server";

import { referenceNoteSchema } from "@/modules/reference-patterns/schemas/reference-note";
import { actionClient } from "@/shared/lib/safe-action";

export const submitReferenceNoteAction = actionClient
  .inputSchema(referenceNoteSchema)
  .action(async ({ parsedInput }) => {
    const title = parsedInput.title.trim();
    const message = parsedInput.message.trim();
    const wordCount = message.split(/\s+/).filter(Boolean).length;

    return {
      message,
      title,
      wordCount,
    };
  });
