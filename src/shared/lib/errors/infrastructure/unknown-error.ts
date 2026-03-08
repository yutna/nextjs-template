import { InfrastructureError } from "./infrastructure-error";

/**
 * Wraps an unexpected error that doesn't fit any known category.
 * Used by toAppError() to normalize unknown catch values into AppError.
 */
export class UnknownError extends InfrastructureError {
  constructor(message: string, cause?: unknown) {
    super({ cause, code: "UNKNOWN_ERROR", message });
  }
}
