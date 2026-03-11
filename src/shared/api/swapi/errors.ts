import "server-only";

function formatUnknownError(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export class SwapiRequestError extends Error {
  readonly _tag = "SwapiRequestError";
  readonly endpoint: string;

  constructor(endpoint: string, error: unknown) {
    super(`SWAPI request failed for ${endpoint}: ${formatUnknownError(error)}`);
    this.endpoint = endpoint;
    this.name = this._tag;
  }
}

export class SwapiValidationError extends Error {
  readonly _tag = "SwapiValidationError";
  readonly endpoint: string;

  constructor(endpoint: string, error: unknown) {
    super(`SWAPI validation failed for ${endpoint}: ${formatUnknownError(error)}`);
    this.endpoint = endpoint;
    this.name = this._tag;
  }
}

export type SwapiError = SwapiRequestError | SwapiValidationError;
