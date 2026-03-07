import { DomainError } from "./domain-error";

export class ConflictError extends DomainError {
  constructor(message: string, code = "CONFLICT") {
    super({ code, message, statusCode: 409 });
  }
}
