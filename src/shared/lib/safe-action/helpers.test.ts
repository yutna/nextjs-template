import { describe, expect, it } from "vitest";

import { AppError } from "@/shared/lib/errors/app-error";
import { NotFoundError } from "@/shared/lib/errors/domain/not-found-error";
import { DatabaseError } from "@/shared/lib/errors/infrastructure/database-error";

import { handleServerError } from "./helpers";

// Concrete AppError for testing isOperational: false path
class TestInfraError extends AppError {
  constructor() {
    super({
      code: "TEST_ERROR",
      isOperational: false,
      message: "infra detail",
      statusCode: 500,
    });
  }
}

describe("handleServerError", () => {
  it("returns the error message for an operational AppError", () => {
    const err = new NotFoundError("User");
    expect(handleServerError(err)).toBe("User not found");
  });

  it("returns a generic message for a non-operational AppError", () => {
    const err = new DatabaseError("findUser", new Error("connection refused"));
    expect(handleServerError(err)).toBe(
      "An unexpected error occurred. Please try again.",
    );
  });

  it("returns a generic message for a non-operational AppError subclass", () => {
    const err = new TestInfraError();
    expect(handleServerError(err)).toBe(
      "An unexpected error occurred. Please try again.",
    );
  });

  it("returns a generic message for a plain Error", () => {
    expect(handleServerError(new Error("something broke"))).toBe(
      "An unexpected error occurred. Please try again.",
    );
  });

  it("returns a generic message for a string", () => {
    expect(handleServerError("oops")).toBe(
      "An unexpected error occurred. Please try again.",
    );
  });

  it("returns a generic message for null", () => {
    expect(handleServerError(null)).toBe(
      "An unexpected error occurred. Please try again.",
    );
  });

  it("returns a generic message for undefined", () => {
    expect(handleServerError(undefined)).toBe(
      "An unexpected error occurred. Please try again.",
    );
  });
});
