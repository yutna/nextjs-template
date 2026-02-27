import { InfrastructureError } from "./infrastructure-error";

export class DatabaseError extends InfrastructureError {
  /**
   * @param operation - e.g. "findUser", "createOrder"
   * @param cause     - original DB driver error
   */
  constructor(operation: string, cause?: unknown) {
    super({
      code: "DATABASE_ERROR",
      message: `Database operation failed: ${operation}`,
      cause,
    });
  }
}
