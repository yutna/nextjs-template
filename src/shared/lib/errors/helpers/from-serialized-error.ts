import type { SerializedError } from "@/shared/lib/errors/types";

/**
 * Reconstruct an AppError-like object from a serialized plain object.
 * Used in reportErrorAction to re-attach context when logging client-side errors.
 */
export function fromSerializedError(raw: SerializedError): SerializedError {
  // Returns the plain object as-is; we cannot reconstruct the class,
  // but the shape is fully typed and usable for logging.
  return raw;
}
