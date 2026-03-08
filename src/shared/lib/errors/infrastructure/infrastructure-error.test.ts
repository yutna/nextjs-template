import { describe, expect, it } from "vitest";

import { AppError } from "@/shared/lib/errors/app-error";

import { InfrastructureError } from "./infrastructure-error";

class TestInfrastructureError extends InfrastructureError {
  constructor(message: string, cause?: unknown) {
    super({ cause, code: "TEST_INFRA_ERROR", message });
  }
}

describe("InfrastructureError", () => {
  it("sets isOperational to false", () => {
    const err = new TestInfrastructureError("test");
    expect(err.isOperational).toBe(false);
  });

  it("sets statusCode to 500", () => {
    expect(new TestInfrastructureError("test").statusCode).toBe(500);
  });

  it("preserves message", () => {
    const err = new TestInfrastructureError("disk full");
    expect(err.message).toBe("disk full");
  });

  it("preserves code", () => {
    expect(new TestInfrastructureError("x").code).toBe("TEST_INFRA_ERROR");
  });

  it("is an instance of AppError and Error", () => {
    const err = new TestInfrastructureError("x");
    expect(err).toBeInstanceOf(InfrastructureError);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(Error);
  });

  it("preserves cause when provided", () => {
    const cause = new Error("root cause");
    expect(new TestInfrastructureError("wrapped", cause).cause).toBe(cause);
  });

  it("works without a cause", () => {
    expect(new TestInfrastructureError("no cause").cause).toBeUndefined();
  });
});
