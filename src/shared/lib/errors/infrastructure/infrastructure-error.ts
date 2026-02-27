import { AppError } from "@/shared/lib/errors/app-error";

import type { AppErrorOptions } from "@/shared/lib/errors/types";

export abstract class InfrastructureError extends AppError {
  constructor(options: Omit<AppErrorOptions, "isOperational" | "statusCode">) {
    super({ ...options, statusCode: 500, isOperational: false });
  }
}
