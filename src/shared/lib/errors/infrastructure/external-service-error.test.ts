import { describe, expect, it } from "vitest";

import { ExternalServiceError } from "./external-service-error";
import { isOperationalError } from "@/shared/lib/errors/helpers/is-operational-error";

describe("ExternalServiceError", () => {
  it("has statusCode 500, correct code, service field, and is NOT operational", () => {
    const err = new ExternalServiceError("stripe");
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe("EXTERNAL_SERVICE_ERROR");
    expect(err.service).toBe("stripe");
    expect(err.message).toBe('External service "stripe" is unavailable');
    expect(err.isOperational).toBe(false);
  });

  it("preserves cause", () => {
    const cause = new Error("timeout");
    expect(new ExternalServiceError("sendgrid", cause).cause).toBe(cause);
  });

  it("is not operational", () => {
    expect(isOperationalError(new ExternalServiceError("sendgrid"))).toBe(
      false,
    );
  });
});
