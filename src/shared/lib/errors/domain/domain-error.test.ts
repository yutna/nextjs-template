import { describe, expect, it } from "vitest";

import { AppError } from "@/shared/lib/errors/app-error";

import { DomainError } from "./domain-error";

class TestDomainError extends DomainError {
  constructor(message: string, cause?: unknown) {
    super({ cause, code: "TEST_DOMAIN_ERROR", message, statusCode: 400 });
  }
}

describe("DomainError", () => {
  it("sets isOperational to true", () => {
    const err = new TestDomainError("test");
    expect(err.isOperational).toBe(true);
  });

  it("preserves message and statusCode", () => {
    const err = new TestDomainError("something went wrong");
    expect(err.message).toBe("something went wrong");
    expect(err.statusCode).toBe(400);
  });

  it("preserves code", () => {
    expect(new TestDomainError("x").code).toBe("TEST_DOMAIN_ERROR");
  });

  it("is an instance of AppError and Error", () => {
    const err = new TestDomainError("x");
    expect(err).toBeInstanceOf(DomainError);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(Error);
  });

  it("preserves cause when provided", () => {
    const cause = new Error("root cause");
    expect(new TestDomainError("wrapped", cause).cause).toBe(cause);
  });

  it("works without a cause", () => {
    expect(new TestDomainError("no cause").cause).toBeUndefined();
  });
});
