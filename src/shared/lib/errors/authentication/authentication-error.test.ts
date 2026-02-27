import { describe, expect, it } from "vitest";

import { AuthenticationError } from "./authentication-error";

describe("AuthenticationError", () => {
  it("has statusCode 401, default code, and is operational", () => {
    const err = new AuthenticationError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("AUTHENTICATION_REQUIRED");
    expect(err.isOperational).toBe(true);
  });

  it("accepts a custom message and code", () => {
    const err = new AuthenticationError("Token invalid", "TOKEN_INVALID");
    expect(err.message).toBe("Token invalid");
    expect(err.code).toBe("TOKEN_INVALID");
  });
});
