import { describe, expect, it } from "vitest";

import { AuthorizationError } from "./authorization-error";

describe("AuthorizationError", () => {
  it("has statusCode 403, default code, and is operational", () => {
    const err = new AuthorizationError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("INSUFFICIENT_PERMISSIONS");
    expect(err.isOperational).toBe(true);
  });

  it("accepts a custom message and code", () => {
    const err = new AuthorizationError("Admins only", "ADMIN_REQUIRED");
    expect(err.message).toBe("Admins only");
    expect(err.code).toBe("ADMIN_REQUIRED");
  });
});
