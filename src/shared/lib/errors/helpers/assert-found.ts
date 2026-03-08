import { NotFoundError } from "@/shared/lib/errors/domain/not-found-error";

/**
 * Asserts that a value is non-null and non-undefined.
 * Throws NotFoundError when the value is nullish.
 *
 * @example
 * const user = await db.findUser(id);
 * assertFound(user, "User");          // throws NotFoundError if null/undefined
 * assertFound(user, "User", userId);  // includes id in the error message
 */
export function assertFound<T>(
  value: null | T | undefined,
  resourceName: string,
  id?: number | string,
): asserts value is T {
  if (value === null || value === undefined) {
    throw new NotFoundError(resourceName, id);
  }
}
