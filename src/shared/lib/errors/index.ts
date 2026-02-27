export { AuthenticationError } from "./authentication/authentication-error";
export { SessionExpiredError } from "./authentication/session-expired-error";

export { AuthorizationError } from "./domain/authorization-error";
export { BusinessRuleError } from "./domain/business-rule-error";
export { ConflictError } from "./domain/conflict-error";
export { DomainError } from "./domain/domain-error";
export { NotFoundError } from "./domain/not-found-error";
export { ValidationError } from "./domain/validation-error";

export { isAppError } from "./helpers/is-app-error";
export { isOperationalError } from "./helpers/is-operational-error";
export { fromSerializedError } from "./helpers/from-serialized-error";

export { DatabaseError } from "./infrastructure/database-error";
export { ExternalServiceError } from "./infrastructure/external-service-error";
export { InfrastructureError } from "./infrastructure/infrastructure-error";

export { AppError } from "./app-error";

export type { AppErrorOptions, FieldErrors, SerializedError } from "./types";
