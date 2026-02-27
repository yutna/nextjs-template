import { DomainError } from "./domain-error";

/**
 * Use when a specific business rule is violated that doesn't fit the other categories.
 * Always provide a domain-specific `code`.
 *
 * @example
 * throw new BusinessRuleError("Order is already paid", "ORDER_ALREADY_PAID");
 */
export class BusinessRuleError extends DomainError {
  constructor(message: string, code: string) {
    super({ code, statusCode: 422, message });
  }
}
