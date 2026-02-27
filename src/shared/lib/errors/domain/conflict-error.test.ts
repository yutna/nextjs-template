import { describe, expect, it } from "vitest";

import { ConflictError } from "./conflict-error";

describe("ConflictError", () => {
  it("has statusCode 409, custom code, and is operational", () => {
    const err = new ConflictError("Duplicate email", "USER_EMAIL_DUPLICATE");
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe("USER_EMAIL_DUPLICATE");
    expect(err.isOperational).toBe(true);
  });

  it("uses default code when not provided", () => {
    expect(new ConflictError("dup").code).toBe("CONFLICT");
  });
});
