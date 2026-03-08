import { describe, expect, it } from "vitest";

import { NotFoundError } from "@/shared/lib/errors/domain/not-found-error";
import { DatabaseError } from "@/shared/lib/errors/infrastructure/database-error";

import { isAppError } from "./is-app-error";

describe("isAppError", () => {
  it("returns true for AppError subclasses", () => {
    expect(isAppError(new NotFoundError("X"))).toBe(true);
    expect(isAppError(new DatabaseError("op"))).toBe(true);
  });

  it("returns false for plain Error", () => {
    expect(isAppError(new Error("plain"))).toBe(false);
  });

  it("returns false for primitives", () => {
    expect(isAppError("string")).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
    expect(isAppError(42)).toBe(false);
  });
});
