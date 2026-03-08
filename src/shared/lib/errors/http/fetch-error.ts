import { HttpError } from "./http-error";

import type { FetchErrorOptions } from "./types";

export class FetchError extends HttpError {
  readonly url: string;
  readonly method: string;
  readonly response: Response;

  constructor(options: FetchErrorOptions) {
    const { code, method, response, url } = options;

    super({
      code: code ?? "FETCH_ERROR",
      isOperational: response.status >= 400 && response.status < 500,
      message: `${method} ${url} failed with ${response.status} ${response.statusText}`,
      statusCode: response.status,
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
