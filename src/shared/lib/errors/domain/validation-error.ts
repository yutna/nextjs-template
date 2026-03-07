import { DomainError } from "./domain-error";

import type { FieldErrors } from "@/shared/lib/errors/types";
import type { ZodError } from "zod";

export class ValidationError extends DomainError {
  /**
   * Field-level errors in the same shape as next-safe-action's validationErrors.
   * Allows the client to display per-field feedback without special-casing.
   */
  readonly fieldErrors: FieldErrors;

  constructor(
    message: string,
    fieldErrors: FieldErrors = {},
    code = "VALIDATION_ERROR",
  ) {
    super({ code, message, statusCode: 422 });
    this.fieldErrors = fieldErrors;
  }

  /**
   * Convenience factory: create a ValidationError from a ZodError.
   * Collapses multiple issues per field into a string array.
   */
  static fromZodError(
    error: ZodError,
    code = "VALIDATION_ERROR",
  ): ValidationError {
    const fieldErrors: FieldErrors = {};

    for (const issue of error.issues) {
      const field = issue.path.join(".") || "_root";
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(issue.message);
    }

    return new ValidationError("Validation failed", fieldErrors, code);
  }

  /**
   * Convenience factory for a single-field validation error.
   */
  static forField(
    field: string,
    message: string,
    code = "VALIDATION_ERROR",
  ): ValidationError {
    return new ValidationError(message, { [field]: [message] }, code);
  }
}
