import { AppError } from "@/shared/lib/errors/app-error";

export function handleServerError(err: unknown): string {
  // Known operational errors: return their message directly
  if (err instanceof AppError && err.isOperational) {
    return err.message;
  }

  // Unknown / infrastructure errors: hide details from the client
  return "An unexpected error occurred. Please try again.";
}
