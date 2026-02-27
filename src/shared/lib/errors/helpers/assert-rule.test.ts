import { describe, expect, it } from "vitest";

import { BusinessRuleError } from "@/shared/lib/errors/domain/business-rule-error";

import { assertRule } from "./assert-rule";

describe("assertRule", () => {
  it("does not throw when condition is true", () => {
    expect(() => assertRule(true, "ANY_CODE", "message")).not.toThrow();
  });

  it("throws BusinessRuleError when condition is false", () => {
    expect(() =>
      assertRule(false, "INVALID_QUANTITY", "Quantity must be positive"),
    ).toThrowError(BusinessRuleError);
  });

  it("preserves code on the thrown error", () => {
    try {
      assertRule(false, "INVALID_QUANTITY", "Quantity must be positive");
    } catch (err) {
      expect(err).toBeInstanceOf(BusinessRuleError);
      expect((err as BusinessRuleError).code).toBe("INVALID_QUANTITY");
    }
  });

  it("preserves message on the thrown error", () => {
    try {
      assertRule(false, "CODE", "Custom message");
    } catch (err) {
      expect((err as BusinessRuleError).message).toBe("Custom message");
    }
  });
});
