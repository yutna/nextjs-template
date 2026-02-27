"use server";

import { reportError } from "@/shared/lib/error-reporter";

import type { ErrorContext } from "@/shared/lib/error-reporter";
import type { SerializedError } from "./types";

/**
 * Called from client-side error boundaries.
 * Accepts a serialized (plain-object) representation of the error
 * because actual Error instances cannot be passed across the server/client boundary.
 */
export async function reportErrorAction(
  serializedError: SerializedError,
  context: ErrorContext = {},
): Promise<void> {
  reportError(new Error(serializedError.message), {
    ...context,
    digest: serializedError.digest ?? context.digest,
  });
}
