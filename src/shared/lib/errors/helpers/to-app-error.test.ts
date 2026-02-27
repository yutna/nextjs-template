import { describe, expect, it } from "vitest";

import { AppError } from "@/shared/lib/errors/app-error";
import { NotFoundError } from "@/shared/lib/errors/domain/not-found-error";
import { UnknownError } from "@/shared/lib/errors/infrastructure/unknown-error";

import { toAppError } from "./to-app-error";

describe("toAppError", () => {
  it("returns the same instance when already an AppError", () => {
    const err = new NotFoundError("User");
    expect(toAppError(err)).toBe(err);
  });

  it("wraps a native Error into UnknownError and preserves message and cause", () => {
    const native = new Error("connection refused");
    const result = toAppError(native);

    expect(result).toBeInstanceOf(AppError);
    expect(result).toBeInstanceOf(UnknownError);
    expect(result.message).toBe("connection refused");
    expect(result.cause).toBe(native);
    expect(result.code).toBe("UNKNOWN_ERROR");
    expect(result.statusCode).toBe(500);
    expect(result.isOperational).toBe(false);
  });

  it("wraps a string into UnknownError", () => {
    const result = toAppError("something went wrong");
    expect(result).toBeInstanceOf(UnknownError);
    expect(result.message).toBe("something went wrong");
  });

  it("wraps null", () => {
    expect(toAppError(null).message).toBe("null");
  });

  it("wraps undefined", () => {
    expect(toAppError(undefined).message).toBe("undefined");
  });

  it("wraps a number", () => {
    expect(toAppError(42).message).toBe("42");
  });
});
