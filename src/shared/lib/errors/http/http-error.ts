import { AppError } from "@/shared/lib/errors/app-error";

import type { AppErrorOptions } from "@/shared/lib/errors/types";

export abstract class HttpError extends AppError {
  constructor(options: AppErrorOptions) {
    super(options);
  }
}
