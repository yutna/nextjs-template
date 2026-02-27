"use server";

import { reportError } from "@/shared/lib/error-reporter";
import { actionClient } from "@/shared/lib/safe-action";
import { reportErrorSchema } from "@/shared/schemas/report-error.schema";

/**
 * Called from client-side error boundaries.
 * Accepts a serialized (plain-object) representation of the error
 * because actual Error instances cannot be passed across the server/client boundary.
 */
export const reportErrorAction = actionClient
  .inputSchema(reportErrorSchema)
  .action(async ({ parsedInput }) => {
    reportError(new Error(parsedInput.message), {
      boundary: parsedInput.boundary,
      digest: parsedInput.digest,
      meta: parsedInput.meta,
    });
  });
