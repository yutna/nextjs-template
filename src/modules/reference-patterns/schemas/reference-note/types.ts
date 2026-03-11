import type { z } from "zod";
import type { referenceNoteSchema } from "./reference-note.schema";

export type ReferenceNoteInput = z.infer<typeof referenceNoteSchema>;
