import { describe, expect, it } from "vitest";

import { DatabaseError } from "./database-error";
import { isAppError } from "@/shared/lib/errors/helpers/is-app-error";
import { isOperationalError } from "@/shared/lib/errors/helpers/is-operational-error";

describe("DatabaseError", () => {
  it("has statusCode 500, correct code, and is NOT operational", () => {
    const err = new DatabaseError("findUser");
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe("DATABASE_ERROR");
    expect(err.message).toBe("Database operation failed: findUser");
    expect(err.isOperational).toBe(false);
  });

  it("preserves cause", () => {
    const cause = new Error("connection refused");
    expect(new DatabaseError("createOrder", cause).cause).toBe(cause);
  });

  it("is an AppError", () => {
    expect(isAppError(new DatabaseError("op"))).toBe(true);
  });

  it("is not operational", () => {
    expect(isOperationalError(new DatabaseError("op"))).toBe(false);
  });
});
