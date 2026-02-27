import type { AppErrorOptions, SerializedError } from "./types";

export abstract class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly isOperational: boolean;

  /**
   * Populated by Next.js when this error originated on the server.
   * Correlates the client-side boundary with the server log entry.
   */
  digest?: string;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = this.constructor.name;
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.isOperational = options.isOperational ?? false;

    if (options.cause !== undefined) {
      this.cause = options.cause;
    }

    // Maintain correct prototype chain in compiled/transpiled environments
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Returns a plain-object representation safe for JSON.stringify and
   * for passing across the server/client boundary.
   * Stack trace is excluded.
   */
  toJSON(): SerializedError {
    return {
      name: this.name,
      code: this.code,
      statusCode: this.statusCode,
      message: this.message,
      isOperational: this.isOperational,
      ...(this.digest ? { digest: this.digest } : {}),
    };
  }

  override toString(): string {
    return `[${this.name}] ${this.code}: ${this.message}`;
  }
}
