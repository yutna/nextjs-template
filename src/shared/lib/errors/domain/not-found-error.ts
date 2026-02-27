import { DomainError } from "./domain-error";

export class NotFoundError extends DomainError {
  /**
   * @param resource - The entity type that was not found, e.g. "User", "Order"
   * @param id       - The identifier that was looked up (optional; omit in public routes)
   * @param code     - Override the default code if the module has a specific one
   */
  constructor(resource: string, id?: string | number, code = "NOT_FOUND") {
    const detail = id !== undefined ? ` with id "${id}"` : "";
    super({
      code,
      statusCode: 404,
      message: `${resource}${detail} not found`,
    });
  }
}
