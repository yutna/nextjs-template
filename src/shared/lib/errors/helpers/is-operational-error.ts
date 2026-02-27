import { isAppError } from "./is-app-error";

import type { AppError } from "@/shared/lib/errors/app-error";

export function isOperationalError(err: unknown): err is AppError {
  return isAppError(err) && err.isOperational;
}
