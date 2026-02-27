import { describe, expect, it } from "vitest";

import { BusinessRuleError } from "./business-rule-error";

describe("BusinessRuleError", () => {
  it("has statusCode 422, custom code, and is operational", () => {
    const err = new BusinessRuleError(
      "Order is already paid",
      "ORDER_ALREADY_PAID",
    );
    expect(err.statusCode).toBe(422);
    expect(err.code).toBe("ORDER_ALREADY_PAID");
    expect(err.message).toBe("Order is already paid");
    expect(err.isOperational).toBe(true);
  });
});
