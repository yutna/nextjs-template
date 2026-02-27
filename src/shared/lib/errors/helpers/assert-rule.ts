import { BusinessRuleError } from "@/shared/lib/errors/domain/business-rule-error";

/**
 * Asserts a business rule condition. Throws BusinessRuleError when false.
 *
 * @example
 * assertRule(quantity > 0, "INVALID_QUANTITY", "Quantity must be positive");
 */
export function assertRule(
  condition: boolean,
  code: string,
  message: string,
): asserts condition {
  if (!condition) {
    throw new BusinessRuleError(message, code);
  }
}
