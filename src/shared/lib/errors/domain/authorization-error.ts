import { DomainError } from "./domain-error";

export class AuthorizationError extends DomainError {
  constructor(
    message = "You do not have permission to perform this action",
    code = "INSUFFICIENT_PERMISSIONS",
  ) {
    super({ code, message, statusCode: 403 });
  }
}
