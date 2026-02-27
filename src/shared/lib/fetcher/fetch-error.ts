import { AppError } from "@/shared/lib/errors/app-error";

import type { FetchErrorOptions } from "./types";

export class FetchError extends AppError {
  readonly url: string;
  readonly method: string;
  readonly response: Response;

  constructor(options: FetchErrorOptions) {
    const { url, method, response, code } = options;

    super({
      code: code ?? "FETCH_ERROR",
      message: `${method} ${url} failed with ${response.status} ${response.statusText}`,
      statusCode: response.status,
      isOperational: response.status >= 400 && response.status < 500,
    });

    this.url = url;
    this.method = method;
    this.response = response;
  }

  get isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  get isServerError(): boolean {
    return this.statusCode >= 500;
  }

  get isNotFound(): boolean {
    return this.statusCode === 404;
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  get isForbidden(): boolean {
    return this.statusCode === 403;
  }
}
