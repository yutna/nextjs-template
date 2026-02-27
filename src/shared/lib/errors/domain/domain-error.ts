import { AppError } from "@/shared/lib/errors/app-error";

import type { AppErrorOptions } from "@/shared/lib/errors/types";

export abstract class DomainError extends AppError {
  constructor(options: Omit<AppErrorOptions, "isOperational">) {
    super({ ...options, isOperational: true });
  }
}
