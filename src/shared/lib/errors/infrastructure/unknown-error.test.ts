import { describe, expect, it } from "vitest";

import { AppError } from "@/shared/lib/errors/app-error";
import { isAppError } from "@/shared/lib/errors/helpers/is-app-error";
import { isOperationalError } from "@/shared/lib/errors/helpers/is-operational-error";

import { InfrastructureError } from "./infrastructure-error";
import { UnknownError } from "./unknown-error";

describe("UnknownError", () => {
  it("has statusCode 500 and UNKNOWN_ERROR code", () => {
    const err = new UnknownError("something broke");
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe("UNKNOWN_ERROR");
  });

  it("preserves the message", () => {
    expect(new UnknownError("disk full").message).toBe("disk full");
  });

  it("is NOT operational", () => {
    expect(new UnknownError("x").isOperational).toBe(false);
  });

  it("is an instance of InfrastructureError, AppError, and Error", () => {
    const err = new UnknownError("x");
    expect(err).toBeInstanceOf(InfrastructureError);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(Error);
  });

  it("preserves cause when provided", () => {
    const cause = new Error("root cause");
    expect(new UnknownError("wrapped", cause).cause).toBe(cause);
  });

  it("works without a cause", () => {
    expect(new UnknownError("no cause").cause).toBeUndefined();
  });

  it("isAppError returns true", () => {
    expect(isAppError(new UnknownError("x"))).toBe(true);
  });

  it("isOperationalError returns false", () => {
    expect(isOperationalError(new UnknownError("x"))).toBe(false);
  });
});
