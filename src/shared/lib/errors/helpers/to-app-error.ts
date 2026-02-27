import { AppError } from "@/shared/lib/errors/app-error";
import { UnknownError } from "@/shared/lib/errors/infrastructure/unknown-error";

/**
 * Normalizes any unknown thrown value into an AppError.
 * Use this in catch blocks to guarantee a typed error upstream.
 *
 * @example
 * try { await db.query(...) }
 * catch (err) { throw toAppError(err); }
 */
export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  if (err instanceof Error) {
    return new UnknownError(err.message, err);
  }

  return new UnknownError(String(err));
}
