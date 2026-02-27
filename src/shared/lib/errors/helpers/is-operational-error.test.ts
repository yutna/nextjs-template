import { describe, expect, it } from "vitest";

import { NotFoundError } from "@/shared/lib/errors/domain/not-found-error";
import { DatabaseError } from "@/shared/lib/errors/infrastructure/database-error";
import { isOperationalError } from "./is-operational-error";

describe("isOperationalError", () => {
  it("returns true for operational errors", () => {
    expect(isOperationalError(new NotFoundError("X"))).toBe(true);
  });

  it("returns false for non-operational AppError", () => {
    expect(isOperationalError(new DatabaseError("op"))).toBe(false);
  });

  it("returns false for non-AppError values", () => {
    expect(isOperationalError(new Error("oops"))).toBe(false);
    expect(isOperationalError("string")).toBe(false);
    expect(isOperationalError(null)).toBe(false);
  });
});
